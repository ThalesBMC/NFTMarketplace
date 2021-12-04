import { ethers } from "ethers";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import { LoginContext } from "../context/LoginContext";
export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
   const {
   signer
  } = useContext(LoginContext);
  useEffect(() => {
    loadNFTs();
  }, [signer]);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
   
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();
  
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
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);

    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl text-white">No assets created</h1>;
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2 text-white">Items Created</h2>
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
                style={{ height: "15.625rem" }}
                alt="Sunset in the mountains"
              />
              <div class="px-6 py-4">
                <div class=" text-white font-bold text-xl mb-2">
                  {" "}
                  {nft.name}
                </div>
                <p class="text-white text-base">{nft.description}</p>
              </div>
              <div class="px-6 py-4">
                <div class=" text-white font-bold text-xl mb-2"> Price</div>
                <p class=" font-bold text-base" style={{ color: "#984dc4" }}>
                  {nft.price} Matic
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2 text-white">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
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
                    style={{ height: "15.625rem" }}
                    alt="Sunset in the mountains"
                  />
                  <div class="px-6 py-4">
                    <div class=" text-white font-bold text-xl mb-2">
                      {" "}
                      {nft.name}
                    </div>
                    <p class="text-white text-base">{nft.description}</p>
                  </div>
                  <div class="px-6 py-4">
                    <div class=" text-white font-bold text-xl mb-2"> Price</div>
                    <p class="text-white font-bold text-base" style={{ color: "#984dc4" }}>
                      {nft.price} Matic
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
