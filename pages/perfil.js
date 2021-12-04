import React, { useState, useEffect, useContext } from "react";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";
import { CardProfile } from "../components/CardProfile";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { EditText, EditTextarea } from "react-edit-text";
import "react-edit-text/dist/index.css";
import { LoginContext } from "../context/LoginContext";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export default function Perfil() {
  const { users, getUsers, userInfo, walletId,signer } = useContext(LoginContext);
  const inputFileRef = React.useRef();

  const [editable, setEditable] = useState(true);
  const [editable2, setEditable2] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFavorites, setNewFavorites] = useState([1, 2]);
  const [balance, setBalance] = useState(0);
  const [update, setUpdate] = useState(false);
  const [hover, setHover] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [edit, setEdit] = useState(false);
  const [colorInput, setColorInput] = useState(false);
  const [page, setPage] = useState("favorites");
  const [favoritedList, setFavoritedList] = useState([]);
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [nftCreated, setNftCreated] = useState("");

  const [nftsOwned, setNftsOwned] = useState([]);
  const [loadingStateOwned, setLoadingStateOwned] = useState("not-loaded");
  useEffect(() => {
    loadNFTsOwned();
  }, [signer]);
  async function loadNFTsOwned() {
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
    setNftsOwned(items);

    setLoadingStateOwned("loaded");
  }
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
 

    setNftCreated(items);
    setLoadingState("loaded");
  }
  useEffect(() => {
    if (users) {
      getFavorites();
    }
  }, [users, walletId]);
  const getFavorites = async () => {
    let teste2 = users.filter((e) => e.walletId === walletId);
    if (teste2[0]) {
      setFavoritedList(teste2[0].favorites);
    }
  };
  async function onChange(e) {
    const file = e.target.files[0];
    try {
    
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      await setFileUrl(url);

      addProfileImage(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  const addProfileImage = async (urlImg) => {
    try {
  
      let teste = users.filter((e) => e.walletId === walletId);
     
      if (teste.length) {
      
        const userDoc = doc(db, "users", teste[0].id);
        await updateDoc(userDoc, {
          imgUrl: urlImg,
        });
      }
      getUsers();
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };
  const updateUserName = async (i) => {
    let teste = users.filter((e) => e.walletId === walletId);
    if (teste.length > 0) {
      const userDoc = doc(db, "users", teste[0].id);
      await updateDoc(userDoc, {
        name: i,
      });

      getUsers();
    }
  };
  const updateUserDescription = async (i) => {
    let teste = users.filter((e) => e.walletId === walletId);
 
    if (teste.length > 0) {
      const userDoc = doc(db, "users", teste[0].id);
      await updateDoc(userDoc, {
        description: i,
      });

      getUsers();
    }
  };

  const onBtnClick = () => {
    /*Collecting node-element and performing click*/
    inputFileRef.current.click();
  };

  const toggleHover = (value) => {
    setHover(value);
  };
  const setColor = (value) => {
    setColorInput(!colorInput);
  };
  const onSetTextName = (value) => {
    setEditable(true), updateUserName(value.value);
  };
  const onSetTextDescription = (value) => {
    setEditable2(true), updateUserDescription(value.value);
  };
  return (
    <div>
      <div className="flex justify-center">
        {userInfo.imgUrl ? (
          <div className="flex justify-center items-center ">
            <img
              className="rounded-full mt-4 h-60 w-60 border-4 "
              src={userInfo.imgUrl}
              style={{ borderColor: "#b84ef2", opacity: hover ? "0.5" : "" }}
              onMouseEnter={() => toggleHover(true)}
              onMouseLeave={() => toggleHover(false)}
            />

            <img
              onMouseEnter={() => toggleHover(true)}
              src={"/editing.png"}
              style={{
                width: "30px",
                height: "30px",
                position: "absolute",
                zIndex: 1,
                display: hover ? "" : "none",
                cursor: "pointer",
              }}
              onClick={onBtnClick}
            />

            <input
              ref={inputFileRef}
              type="file"
              name="Asset"
              className="my-4"
              style={{ display: "none" }}
              onChange={onChange}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center ">
            <img
              className="rounded-full mt-4 h-60 w-60 border-4 "
              style={{
                borderColor: "#b84ef2",
                opacity: hover ? "0.5" : "",
                backgroundColor: userInfo.imgUrl ? "" : "#b84ef2",
              }}
              onMouseEnter={() => toggleHover(true)}
              onMouseLeave={() => toggleHover(false)}
            />

            <img
              onMouseEnter={() => toggleHover(true)}
              src={"/editing.png"}
              style={{
                width: "30px",
                height: "30px",
                position: "absolute",
                zIndex: 1,
                display: hover ? "" : "none",
                cursor: "pointer",
              }}
              onClick={onBtnClick}
            />

            <input
              ref={inputFileRef}
              type="file"
              name="Asset"
              className="my-4"
              style={{ display: "none" }}
              onChange={onChange}
            />
          </div>
        )}
      </div>
      <div
        className="flex flex-col items-center mt-8"
        // style={{
        //   display: "flex",
        //   flexDirection: "column",
        //   alignItems: "center",
        // }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <EditText
            className="text-6xl 	"
            style={{
              color: "white",
              backgroundColor: "#18142c",
              height: "100px",
            }}
            placeholder={userInfo.name ? userInfo.name : "name"}
            name="textbox2"
            onSave={onSetTextName}
            readonly={editable}
          />
          <img
            onClick={() => setEditable(false)}
            src={"/pencil.png"}
            style={{
              width: "30px",
              height: "30px",
              marginLeft: "20px",
              cursor: "pointer",
            }}
          />
          {/* <img  onClick={()=>{setEditable(true), updateUserName(textName)}}  src={"/check-mark.png"} style={{width:'30px', height:'30px', marginLeft:"20px",  cursor:"pointer"}}/> */}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <EditText
            className="text-white text-6xl	"
            style={{
              color: "white",
              backgroundColor: "#18142c",
              height: "100px",
            }}
            placeholder={
              userInfo.description ? userInfo.description : "description"
            }
            name="textbox3"
            onSave={onSetTextDescription}
            readonly={editable2}
          />
          <img
            onClick={() => setEditable2(false)}
            src={"/pencil.png"}
            style={{
              width: "30px",
              height: "30px",
              marginLeft: "20px",
              cursor: "pointer",
            }}
          />
          {/* <img  onClick={()=>{setEditable2(true), updateUserDescription(textDescription)}} src={"/check-mark.png"} style={{width:'30px', height:'30px', marginLeft:"20px",  cursor:"pointer"}}/> */}
        </div>

        <div className="text-white text-xl mt-4 ">Wallet id: {userInfo.walletId}</div>
      </div>

      <div className="flex flex-row items-center mt-8 space-x-10 justify-center">
        <div className="flex flex-col items-center group">
          <div
            className="text-white text-4xl cursor-pointer "
            style={{ alignText: "center" }}
            onClick={() => setPage("favorites")}
          >
            Favorites
          </div>
          {page === "favorites" && (
              <div
                  className="inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-100 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
          )}
        </div>
        <div className="flex flex-col items-center group">
          <div
            className="text-white text-4xl cursor-pointer "
            style={{ alignText: "center" }}
            onClick={() => setPage("owned")}
          >
            Owned
          </div>
          {page === "owned" && (
              <div
                  className="inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-100 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
          )}
        </div>
        <div className="flex flex-col items-center group">
          <div
            className="text-white text-4xl cursor-pointer "
            style={{ alignText: "center" }}
            onClick={() => setPage("created")}
          >
            Created
          </div>
          {page === "created" && (
              <div
                  className="inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-100 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
          )}
        </div>
      </div>
      {page === "favorites" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ml-16">
          {favoritedList
            ? favoritedList.map((e) => <CardProfile key={e.image} data={e} />)
            : null}
        </div>
      )}
      {page === "created" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ml-16">
          {nftCreated
            ? nftCreated.map((e) => <CardProfile key={e.image} data={e} />)
            : null}
        </div>
      )}
      {page === "owned" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ml-16">
          {nftsOwned
            ? nftsOwned.map((e) => <CardProfile key={e.image} data={e} />)
            : null}
        </div>
      )}
      <></>
    </div>
  );
}
