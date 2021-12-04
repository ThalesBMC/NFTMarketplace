import { ethers } from "ethers";
import { useEffect, useState,useContext } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { nftmarketaddress, nftaddress } from "../config";
import { LoginContext } from "../context/LoginContext";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export default function MyAssets() {
  const {
   signer
  } = useContext(LoginContext);
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [modal,setModal] = useState(false)
  const [sellNFTInfo,setSellNFT] = useState("")
  const [priceSell,setPriceSell]= useState("")
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
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
   
    setLoadingState("loaded");
  }
  async function sellNFT(nft) {
    
    const web3Modal = new Web3Modal();
    //connecta com metamask
    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);
    //coleta a assinatura para validar a transação
  
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    const listingPrice = await marketContract.getListingPrice();
   
    const tx = await marketContract.putItemToResell(
      nftaddress,
      nft.itemId - 1,
      ethers.utils.parseUnits(priceSell, "ether"),
      { value: listingPrice.toString() }
    );
    
    await tx.wait();
 
    loadNfts();
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl text-white">No assets owned</h1>;
  return (
    <div className="flex ">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <>
              {nft.image ? (
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
                     { setModal(true);
                      setSellNFT({
                        image: nft.image,
                        price: nft.price,
                        itemId: nft.tokenId,
                      })}
                    }
                  >
                    Sell
                  </button>
                </div>
              ) : (
                <></>
              )}
            </>

          ))}
        </div>
      </div>
      {modal?
      <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                
                  <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                   Sell NFT
                  </h3>
                  <div class="mt-4">
                   <input
                      placeholder="Asset Price in Matic"
                      className="mt-2 border rounded p-4"
                      type="number"
                      min="0.1"
                      onChange={(e) =>
                        setPriceSell(e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button disabled={!priceSell} onClick={()=>{sellNFT(sellNFTInfo);setModal(false);}} type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
               Sell
              </button>
              <button onClick={()=>{setModal(false)}} type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
    </div>
      :<></>}
    </div>
  );
}
