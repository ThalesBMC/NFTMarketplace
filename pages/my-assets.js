import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name : meta.data.name,
            description:meta.data.description
        };
        return item;
      })
    );
    setNfts(items);
    console.log(items);
    setLoadingState("loaded");
  }
  async function sellNFT(nft) {
    const web3Modal = new Web3Modal();
    //connecta com metamask
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    //coleta a assinatura para validar a transação
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    const data = await marketContract.fetchMyNFTs();
    const contract = new ethers.Contract(
      data[0][nft.itemId],
      Market.abi,
      signer
    );
    //cria o contrato com a assinatura.
    console.log(signer);

    const transaction = await contract.transferFrom(
      nftaddress,
      data[0][nft.itemId],
      nftmarketaddress,
      nft.itemId
    );
    console.log("a");
    await transaction.wait();
    console.log("ab");
  }
  console.log(nfts);
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;
  return (
    <div className="flex ">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              class="max-w-sm rounded overflow-hidden shadow-lg border-purple-700 	rounded"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
              }}
            >
              <img
                class="w-full"
                src={nft.image}
                style={{ height: "450px" }}
                alt="Sunset in the mountains"
              />
              <div class="px-6 py-4">
                <div class=" text-white font-bold text-xl mb-2">
                 
                  {nft.name}
                </div>
                <p class="text-white text-base">{nft.description}</p>
              </div>
              <div class="px-6 py-4">
                <div class=" text-white font-bold text-xl mb-2"> Price</div>
                <p class="font-bold text-base" style={{ color: "#984dc4" }}>
                  {nft.price} Matic
                </p>
              </div>

              <button
                className="bg-purple-600	 hover:bg-purple-900 w-full text-white font-bold py-2 px-12 rounded-t-md "
                onClick={() =>
                  sellNFT({
                    image: nft.image,
                    price: nft.price,
                    itemId: nft.tokenId,
                  })
                }
              >
                Sell
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
