// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "***REMOVED***",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "***REMOVED***",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "***REMOVED***",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "***REMOVED***.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "***REMOVED***",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:***REMOVED***:web:876d33d026ca1687903363",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "***REMOVED***"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;