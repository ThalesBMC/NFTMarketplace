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
import axios from "axios";

import { LoginContext } from "../context/LoginContext";
import { UserProfile } from "../components/UserProfile";
export default function users() {
  const { users, getUsers, userInfo, walletId } = useContext(LoginContext);
 
  return (
    <div style={{ marginTop: "20px" }}>
      {users ? users.map((e) => <UserProfile key={e.walletId} data={e} />) : null}
    </div>
  );
}
