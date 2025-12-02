import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  serverTimestamp,
  collection,
  query,
  orderBy as fbOrderBy,
  limit as fbLimit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  where as fbWhere
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCg4ff72caOr1rk9y7kZAkUbcyjqfPuMLI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ourwebsite223.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ourwebsite223",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ourwebsite223.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "978864749848",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:978864749848:web:f1e635f87e2ddcc007f26d"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
      } else {
        resolve({
          uid: user.uid,
          email: user.email,
          full_name: user.displayName || user.email
        });
      }
    });
  });
}

export {
  auth,
  db,
  serverTimestamp,
  collection,
  query,
  fbOrderBy as orderBy,
  fbLimit as limit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  fbWhere as where
};
