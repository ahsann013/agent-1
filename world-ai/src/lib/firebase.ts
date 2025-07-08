import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfSLl2-njGyUPEIpnxBE8ARNEGcxEzPXY",
  authDomain: "awishai-7e70f.firebaseapp.com",
  projectId: "awishai-7e70f",
  storageBucket: "awishai-7e70f.firebasestorage.app",
  messagingSenderId: "124572155982",
  appId: "1:124572155982:web:56d3cb1c61b78dc4c1031f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 