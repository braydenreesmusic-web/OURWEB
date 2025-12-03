import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
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

// Read Vite client env vars (must use VITE_* names)
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Minimal validation + helpful warnings
const required = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]
const missing = required.filter((k) => !cfg[k])
if (missing.length) {
  console.warn('[firebase] Missing env vars:', missing.join(', '))
}
// Common misconfig: storageBucket should be <projectId>.appspot.com
if (cfg.projectId && cfg.storageBucket && !cfg.storageBucket.endsWith('appspot.com')) {
  console.warn('[firebase] storageBucket should usually be ', `${cfg.projectId}.appspot.com`)
}

let app;
if (!getApps().length) {
  app = initializeApp(cfg);
} else {
  app = getApps()[0];
}

// Only touch browser-specific SDKs when running in the browser
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const auth = isBrowser ? getAuth() : undefined;

// Use initializeFirestore with long-polling to avoid fetch/CORS issues in some environments
// Additionally guard for non-browser contexts to prevent accidental server-side initialization.
export const db = isBrowser
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true, useFetchStreams: false })
  : undefined;

if (isBrowser) {
  // Helpful diagnostics for common CORS/Fetch stream issues with Firestore Listen
  const origin = window.location.origin;
  const expectedAuthDomain = cfg.authDomain;
  console.info('[firebase] Init', {
    origin,
    projectId: cfg.projectId,
    authDomain: expectedAuthDomain,
    hasApiKey: Boolean(cfg.apiKey),
  });
  if (expectedAuthDomain && !expectedAuthDomain.includes('localhost')) {
    // If running on a custom domain, remind to add it to Firebase Authorized domains
    // This is informational and does not block.
    console.debug('[firebase] Running on origin', origin, 'with authDomain', expectedAuthDomain,
      'Ensure this origin is in Firebase Authentication > Settings > Authorized domains.');
  }
}

export function getCurrentUser() {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }
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
