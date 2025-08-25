// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDtIeyExZhqJKWSM1QvAH5HlWNGIrcPz8E",
  authDomain: "drizacv.firebaseapp.com",
  projectId: "drizacv",
  storageBucket: "drizacv.firebasestorage.app",
  messagingSenderId: "271157129829",
  appId: "1:271157129829:web:f359c3e3b6f87ac29e4c8c",
  measurementId: "G-24MHPE6TXZ"
};

// Inicializar Firebase solo una vez
const app = initializeApp(firebaseConfig);

// Servicios
export const auth = getAuth(app);
export const db = getDatabase(app);
