import React,{useState, useEffect} from 'react'
import {db} from "../firebase.config"
import {collection, getDocs} from 'firebase/firestore'
export default function Perfil () {
    const [users,setUsers] = useState([])
    const usersCollectionRef = collection(db, "users")
    useEffect(()=>{
        const getUsers= async () =>{
            const data= await  getDocs(usersCollectionRef)
            console.log(data)
        }
        getUsers()
    },[])
    return (
        <div>
            teste
        </div>
    )
}
