import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useMemo,
} from "react";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export const LoginContext = createContext();
export const LoginContextProvider = ({ children }) => {
  const inputFileRef = React.useRef();
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState("");

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
    const [favoritedList, setFavoritedList] = useState([]);
  const usersCollectionRef = collection(db, "users");
  const [signer,setSigner] = useState("")
    useEffect(() => {
    if (users) {
      getFavorites();
    }
  }, [users, walletId]);

  useEffect(()=>{
    const initTeste =async()=>{
       const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    connection.on("accountsChanged", (accounts) => {
      const changeAccount = async()=>{
        const web3Modal = new Web3Modal({
        network: "mainnet",
        });
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signerLogin = provider.getSigner();
        setSigner(signerLogin)
        console.log("trocou", signerLogin)
        }
      changeAccount()
    });
    const signerLogin = provider.getSigner();
    setSigner(signerLogin)
  
    }
    initTeste()
  },[])
  const getFavorites = async () => {
    let favorites2 = users.filter((e) => e.walletId === walletId);
    console.log(favorites2,"aqui")
    if (favorites2[0]) {
      let itemsIds = favorites2[0].favorites.map((e) => {
      
        return e.tokenId;
      });
      console.log(itemsIds)
      setFavoritedList(itemsIds);
      
     
    }
  };
  const addFavorite = async (i,type) => {
    let teste2 = users.filter((e) => e.walletId === walletId);
    if(type ==="cardProfile"){
      i['itemId'] = i['tokenId']
    }
    if (teste2[0].favorites) {
      teste2[0].favorites.push(i);

      const userDoc = doc(db, "users", teste2[0].id);

      await updateDoc(userDoc, {
        favorites: teste2[0].favorites,
      });
    } else {
      const userDoc = doc(db, "users", teste2[0].id);

      await updateDoc(userDoc, {
        favorites: [i],
      });
    }
    getUsers();
  };
  const removeFavorite = async (i, type="") => {
    let teste2 = users.filter((e) => e.walletId === walletId);
    if(type ==="cardProfile"){
        i['itemId'] = i['tokenId']
    } 
    if (teste2[0].favorites) {
      // teste2[0].favorites.pop(i);
      const filteredPeople = teste2[0].favorites.filter(
        (item) => item.itemId !== i.itemId
      );

      const userDoc = doc(db, "users", teste2[0].id);

      await updateDoc(userDoc, {
        favorites: filteredPeople,
      });
    }
    getUsers();
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
          imgUrl:""
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
  }, [signer]);
  useEffect(() => {
    let teste = users.filter((e) => e.walletId === walletId);

    if (teste.length > 0) {
      setUserInfo(teste[0]);
    }
  }, [walletId, users,signer]);
  return (
    <LoginContext.Provider value={{ signer,users, getUsers, userInfo, walletId, getFavorites, addFavorite, removeFavorite, favoritedList }}>
      {children}
    </LoginContext.Provider>
  );
};
