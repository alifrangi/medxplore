// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7Bv6KjQVEf54iokEtE6VF7vpmv5r1424",
  authDomain: "medxplore-21fbf.firebaseapp.com",
  projectId: "medxplore-21fbf",
  storageBucket: "medxplore-21fbf.firebasestorage.app",
  messagingSenderId: "12654805338",
  appId: "1:12654805338:web:876d33d026ca1687903363",
  measurementId: "G-8FLR4KQ23N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;