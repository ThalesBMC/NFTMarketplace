import { useState, useContext } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { LoginContext } from "../context/LoginContext";
export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();
  const {
   signer
  } = useContext(LoginContext);
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createMarket() {
    setLoadingCreate(true);
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
   

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    setLoadingCreate(false);

    router.push("/");
  }
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          type="number"
          min="0.1"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />

        <label
          className="text-md font-medium text-white block mb-2 mt-2"
          for="user_avatar"
        >
          Upload file
        </label>
        <input
          onChange={onChange}
          className="block w-full cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-transparent text-sm rounded-lg"
          aria-describedby="user_avatar_help"
          id="user_avatar"
          type="file"
        />
        <div className="mt-1 text-sm text-gray-500" id="user_avatar_help">
          A picture for the NFT
        </div>

        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={createMarket}
          className="bg-purple-600 w-full mt-3	hover:bg-purple-900 w-full text-white font-bold py-2 px-12 rounded flex justify-center "
        >
          Create Digital Asset
          {loadingCreate ? (
            <img
              style={{ width: "30px", height: "30px", marginLeft: "20px" }}
              src={
                "https://icons8.com/preloaders/preloaders/865/Ethereum%20logo%20revolving.gif"
              }
              alt="loading..."
            />
          ) : null}
        </button>
      </div>
    </div>
  );
}
