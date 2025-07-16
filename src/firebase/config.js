import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database"; // <-- Agrega esto

const firebaseConfig = {
  apiKey: "AIzaSyC13ClKfPXAnsom4WS5xyCumqqKH0mZZiA",
  authDomain: "verdetta-54702.firebaseapp.com",
  projectId: "verdetta-54702",
  storageBucket: "verdetta-54702.appspot.com",
  messagingSenderId: "820507286753",
  appId: "1:820507286753:web:bdad0e29231851eb0faba0",
  measurementId: "G-GQ1JGKE8H3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database(); // <-- Cambia esto para usar Realtime Database

export { auth, db };