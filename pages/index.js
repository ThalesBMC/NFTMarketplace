import { ethers } from "ethers";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import Web3Modal from "web3modal";
import { db } from "../firebase-config";
import { nftaddress, nftmarketaddress } from "../config";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { LoginContext } from "../context/LoginContext";
let rpcEndpoint = null;
if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}
import { CardProfile } from "../components/CardProfile";
export default function Home() {
  const {
    users,
    getUsers,
    userInfo,
    walletId,
    removeFavorite,
    addFavorite,
    favoritedList,
    signer
  } = useContext(LoginContext);
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
 
  const [search, setSearch] = useState("");

  useEffect(() => {
    
    loadNFTs();
  }, [signer]);

  async function loadNFTs() {
   
    const provider = new ethers.providers.Web3Provider(web3.currentProvider)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
     
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
   
    const data = await marketContract.fetchMarketItems()
  
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    console.log(items,"dsaddsasda")
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    //abre popup
    
    const web3Modal = new Web3Modal();
    //connecta com metamask
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    //coleta a assinatura para validar a transação
  
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
   
    //cria o contrato com a assinatura.
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
  
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId-1, {
      value: price
    })
   
    await transaction.wait();
    
    loadNFTs();
  }

  const handleOnSearch = (value, results) => {
    setSearch(results);
   
  };
  const handleOnSelect = (item) => {
  
    setSearch([item]);
  };
  const handleOnClear = () => {
    setSearch("");
  };
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl text-white">No items in marketplace</h1>;
 
  return (
    <div>
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className=" w-full  h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <ReactSearchAutocomplete
            items={nfts}
            onSearch={handleOnSearch}
            onSelect={handleOnSelect}
            onClear={handleOnClear}
            autoFocus
            inputDebounce={0}
            maxResults={15}
            fuseOptions={{ minMatchCharLength: 1 }}
            placeholder="Pesquise aqui seu item..."
            styling={{
              border: "0px",
              borderRadius: "10px",
              backgroundColor: "#8B5CF6",
              color: "#FFF",
              fontFamily: "IM Fell DW Pica SC",
              placeholderColor: "#FFF",
              hoverBackgroundColor: "rgb(33, 27, 28,0.5)",
              boxShadow: "rgba(0, 0, 0, 0.5) 0px 4px 10px",
              iconColor: "#FFF",
              fontSize: "1rem",
              height: "60px",
              zIndex: 3,
            }}
          />

          {search ? (
            search.map((nft, i) => (
              <>
                <div
                  key={i}
                  className="max-w-sm rounded overflow-hidden shadow-lg border-purple-700 	rounded   "
                  style={{
                    marginBottom: "20px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
                  }}
                >
                  <div
                    style={{
                      marginRight: "10px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {favoritedList && favoritedList.includes(nft.tokenId) ? (
                      <img
                        style={{
                          position: "absolute",
                          marginTop: "20px",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          
                          removeFavorite(nft);
                        }}
                        src={"/heart.png"}
                      />
                    ) : (
                      <img
                        style={{
                          position: "absolute",
                          marginTop: "10px",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          addFavorite(nft);
                        }}
                        src={"/heart2.png"}
                      />
                    )}
                  </div>
                  <img
                    className="w-full"
                    src={nft.image}
                    style={{ height: "350px" }}
                    alt="Sunset in the mountains"
                  />
                  <div className="px-6 py-4">
                    <div className=" text-white font-bold text-xl mb-2">
                      {nft.name}
                    </div>
                    <p className="text-white text-base">{nft.description}</p>
                  </div>
                  <div className="px-6 py-4">
                    <div className=" text-white font-bold text-xl mb-2">
                      {" "}
                      Price
                    </div>
                    <p
                      className=" font-bold text-base"
                      style={{ color: "#984dc4" }}
                    >
                      {nft.price} MATIC
                    </p>
                  </div>
                  
                 <button
                    
                    className="relative bg-purple-600	 hover:bg-purple-900 transition duration-200  w-full text-white font-bold py-2 px-12 rounded-t-md buttonBright"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                
                </div>
              </>
            ))
          ) : (
            <>
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="max-w-sm rounded overflow-hidden shadow-lg border-purple-700 	rounded"
                  style={{
                    marginBottom: "20px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
                  }}
                >
                  <div
                    style={{
                      marginRight: "10px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {favoritedList && favoritedList.includes(nft.tokenId) ? (
                      <img
                        style={{
                          position: "absolute",
                          marginTop: "10px",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          removeFavorite(nft);
                        }}
                        src={"/heart.png"}
                      />
                    ) : (
                      <img
                        style={{
                          position: "absolute",
                          marginTop: "10px",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          addFavorite(nft);
                        }}
                        src={"/heart2.png"}
                      />
                    )}
                  </div>
                  <img
                    className="w-full"
                    src={nft.image}
                    style={{ height: "15.625rem" }}
                    alt="Sunset in the mountains"
                  />
                  <div className="px-6 py-4">
                    <div className=" text-white font-bold text-xl mb-2">
                      {nft.name}
                    </div>
                    <p className="text-white text-base">{nft.description}</p>
                  </div>
                  <div className="px-6 py-4">
                    <div className=" text-white font-bold text-xl mb-2">
                      {" "}
                      Price
                    </div>
                    <p
                      className=" font-bold text-base"
                      style={{ color: "#984dc4" }}
                    >
                      {nft.price} MATIC
                    </p>
                  </div>
                 
                
                                  
                               <button
                    
                    className="relative bg-purple-600	 hover:bg-purple-900 transition duration-200  w-full text-white font-bold py-2 px-12 rounded-t-md buttonBright"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
