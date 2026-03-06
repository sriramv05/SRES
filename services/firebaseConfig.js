import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQH_ONoRhSIN6zhHjavaPWOSLdGZJSRDc",
  authDomain: "sresapp-11e7b.firebaseapp.com",
  projectId: "sresapp-11e7b",
  storageBucket: "sresapp-11e7b.firebasestorage.app",
  messagingSenderId: "981531541749",
  appId: "1:981531541749:web:b2b01aa4075f15a8b585bc",
  measurementId: "G-0EZ19G5PSH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);