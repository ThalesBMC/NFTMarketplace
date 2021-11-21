import React, { useState, useEffect } from "react";
import { db } from "./firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";
import { CardProfile } from "../components/CardProfile";
import Web3Modal from "web3modal";
import { EditText, EditTextarea } from "react-edit-text";
import "react-edit-text/dist/index.css";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export default function Perfil() {
  const inputFileRef = React.useRef();
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState("");
  const usersCollectionRef = collection(db, "users");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFavorites, setNewFavorites] = useState([1, 2]);
  const [balance, setBalance] = useState(0);
  const [update, setUpdate] = useState(false);
  const [hover, setHover] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [edit, setEdit] = useState(false);
  const [colorInput, setColorInput] = useState(false);
  const [page, setPage] = useState("owned");
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      console.log(url, "3");
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      await setFileUrl(url);
      console.log(url, "l");
      addProfileImage(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  const addProfileImage = async (urlImg) => {
    try {
      let teste = users.filter((e) => e.walletId === walletId);
      if (teste.length > 0) {
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
  const updateUser = async (i) => {
    let teste = users.filter((e) => e.walletId === walletId);
    if (teste.length > 0) {
      const userDoc = doc(db, "users", teste[0].id);
      await updateDoc(userDoc, {
        name: newName,
        description: newDescription,
        favorites: newFavorites,
      });

      getUsers();
    }
  };
  const createUser = async () => {
    const web3Modal = new Web3Modal();
    //connecta com metamask
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    //coleta a assinatura para validar a transação
    const signer = provider.getSigner();
    const walletId = await signer.getAddress();
    setWalletId(walletId);
    if (users.length > 0) {
      if (users.filter((e) => e.walletId === walletId).length > 0) {
      } else {
        console.log("criado");
        await addDoc(usersCollectionRef, {
          walletId: walletId,
          name: newName,
          description: newDescription,
          favorites: [],
        });
      }
    }
  };
  const getUsers = async () => {
    console.log(users, "att");
    const data = await getDocs(usersCollectionRef);
    let dataUsers = await data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setUsers(dataUsers);
  };
  useEffect(() => {
    if (users.length) {
      createUser();
    }
  }, [users]);
  useEffect(() => {
    getUsers();
  }, []);
  useEffect(() => {
    let teste = users.filter((e) => e.walletId === walletId);

    if (teste.length > 0) {
      setUserInfo(teste[0]);
    }
  }, [walletId, users]);
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
  return (
    <div>
      <div className="flex justify-center">
        {userInfo.imgUrl && (
          <div className="flex justify-center items-center">
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
        <div>
          <EditText
            className="text-white text-6xl	"
            style={{ color: colorInput ? "grey" : "white" }}
            value={userInfo.name}
            name="textbox2"
            onEditMode={setColor}
            onBlur={setColor}
            readonly
          />
        </div>
        <div>
          <EditText
            className="text-white text-6xl	"
            style={{ color: colorInput ? "grey" : "white" }}
            value={userInfo.description}
            name="textbox2"
            onEditMode={setColor}
            onBlur={setColor}
            readonly
          />
        </div>

        <div className="text-white text-1xl mt-4">{userInfo.walletId}</div>
      </div>

      <div className="flex flex-row items-center mt-8 space-x-10 justify-center">
        <div className="flex flex-col items-center">
          <div
            className="text-white text-4xl"
            style={{ alignText: "center" }}
            onClick={() => setPage("owned")}
          >
            Owned
          </div>
          {page === "owned" && (
            <div
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
        <div className="flex flex-col items-center ">
          <div
            className="text-white text-4xl"
            style={{ alignText: "center" }}
            onClick={() => setPage("created")}
          >
            Created
          </div>
          {page === "created" && (
            <div
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
        <div className="flex flex-col items-center">
          <div
            className="text-white text-4xl"
            style={{ alignText: "center" }}
            onClick={() => setPage("favorites")}
          >
            Favorites
          </div>
          {page === "favorites" && (
            <div
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
        <div className="flex flex-row items-center mt-8">
          {userInfo
            ? userInfo.favorites.map((e) => <CardProfile data={e} />)
            : null}
        </div>
      )}
      <></>
    </div>
  );
}
