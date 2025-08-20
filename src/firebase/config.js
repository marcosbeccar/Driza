import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database"; // <-- Agrega esto

const firebaseConfig = {
  apiKey: "AIzaSyDyu_MwcZMqbzwZBhIsSUCblvfvQ5DrEWo",
  authDomain: "mercado-udesa.firebaseapp.com",
  databaseURL: "https://mercado-udesa-default-rtdb.firebaseio.com",
  projectId: "mercado-udesa",
  storageBucket: "mercado-udesa.firebasestorage.app",
  messagingSenderId: "94304624728",
  appId: "1:94304624728:web:b523a914b835654c70ea2d",
  measurementId: "G-XMR84SV6M8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database(); // <-- Cambia esto para usar Realtime Database

export { auth, db };