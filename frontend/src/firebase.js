// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAWbe44ChuHVZsd9aE5Av93YtbNg_gz_Og",
  authDomain: "gigconnect-7d73e.firebaseapp.com",
  projectId: "gigconnect-7d73e",
  storageBucket: "gigconnect-7d73e.firebasestorage.app",
  messagingSenderId: "791002327884",
  appId: "1:791002327884:web:89887f5d5fa67bf3d6fde9",
  measurementId: "G-RRT1M5MFCD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);