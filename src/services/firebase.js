// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7Bv6KjQVEf54iokEtE6VF7vpmv5r1424",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medxplore-21fbf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medxplore-21fbf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medxplore-21fbf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12654805338",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12654805338:web:876d33d026ca1687903363",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8FLR4KQ23N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;