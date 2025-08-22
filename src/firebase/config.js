// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDoigDBLklzR_yLDS5GkjE8Us9PjRFbzQg",
  authDomain: "driza-9870c.firebaseapp.com",
  databaseURL: "https://driza-9870c-default-rtdb.firebaseio.com",
  projectId: "driza-9870c",
  storageBucket: "driza-9870c.firebasestorage.app",
  messagingSenderId: "51829864704",
  appId: "1:51829864704:web:ab764fb9a03b9993309be5",
  measurementId: "G-GHBQZRSHJ9"
};

// Inicializar Firebase solo una vez
const app = initializeApp(firebaseConfig);

// Servicios
export const auth = getAuth(app);
export const db = getDatabase(app);
