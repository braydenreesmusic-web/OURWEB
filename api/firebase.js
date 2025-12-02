// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, serverTimestamp, collection, query, orderBy as fbOrderBy, limit as fbLimit, getDocs, addDoc, doc, updateDoc, deleteDoc, where as fbWhere } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg4ff72caOr1rk9y7kZAkUbcyjqfPuMLI",
  authDomain: "ourwebsite223.firebaseapp.com",
  databaseURL: "https://ourwebsite223-default-rtdb.firebaseio.com",
  projectId: "ourwebsite223",
  storageBucket: "ourwebsite223.firebasestorage.app",
  messagingSenderId: "978864749848",
  appId: "1:978864749848:web:f1e635f87e2ddcc007f26d",
  measurementId: "G-823MYFCCMG"
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) resolve(null);
      else resolve({ uid: user.uid, email: user.email, full_name: user.displayName || user.email });
    });
  });
}

export { auth, db, serverTimestamp, collection, query, fbOrderBy as orderBy, fbLimit as limit, getDocs, addDoc, doc, updateDoc, deleteDoc, fbWhere as where };
// firebase.js
// Minimal Firebase v9 (modular) initializer and helpers.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, serverTimestamp, collection, query, orderBy as fbOrderBy, limit as fbLimit, getDocs, addDoc, doc, updateDoc, deleteDoc, where as fbWhere } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg4ff72caOr1rk9y7kZAkUbcyjqfPuMLI",
  authDomain: "ourwebsite223.firebaseapp.com",
  databaseURL: "https://ourwebsite223-default-rtdb.firebaseio.com",
  projectId: "ourwebsite223",
  storageBucket: "ourwebsite223.firebasestorage.app",
  messagingSenderId: "978864749848",
  appId: "1:978864749848:web:f1e635f87e2ddcc007f26d",
  measurementId: "G-823MYFCCMG"
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) resolve(null);
      else resolve({ uid: user.uid, email: user.email, full_name: user.displayName || user.email });
    });
  });
}

export { auth, db, serverTimestamp, collection, query, fbOrderBy as orderBy, fbLimit as limit, getDocs, addDoc, doc, updateDoc, deleteDoc, fbWhere as where };
