import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfpsJ4GS7p8cjJY6Mi4Ex2Jad2XfGoTJY",
  authDomain: "spaghetti-e2346.firebaseapp.com",
  databaseURL: "https://spaghetti-e2346-default-rtdb.firebaseio.com",
  projectId: "spaghetti-e2346",
  storageBucket: "spaghetti-e2346.appspot.com",
  messagingSenderId: "609977298920",
  appId: "1:609977298920:web:74be52abad58e92c7afe5d",
  measurementId: "G-BLMK0MFPDB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Instancias de servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
