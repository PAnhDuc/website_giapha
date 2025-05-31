import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  addDoc, // Thêm dòng này
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
  authDomain: "test-web-f5a0a.firebaseapp.com",
  projectId: "test-web-f5a0a",
  storageBucket: "test-web-f5a0a.firebasestorage.app",
  messagingSenderId: "230169455517",
  appId: "1:230169455517:web:a21536928823eb1d105d74",
  measurementId: "G-892G3PZS52",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  addDoc, // Thêm dòng này
};
