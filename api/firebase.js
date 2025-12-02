// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, serverTimestamp, collection, query, orderBy as fbOrderBy, limit as fbLimit, getDocs, addDoc, doc, updateDoc, deleteDoc, where as fbWhere } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
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
