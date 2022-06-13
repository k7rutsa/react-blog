import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "k7-blog-v1.firebaseapp.com",
  projectId: "k7-blog-v1",
  storageBucket: "k7-blog-v1.appspot.com",
  messagingSenderId: "842121196543",
  appId: "1:842121196543:web:7993f720a880a8ecbcadca",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
