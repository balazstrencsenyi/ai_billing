import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNVT2sMXSVakBVcA47NkMCX26jH9qD09o",
  authDomain: "szamlai-de0a5.firebaseapp.com",
  projectId: "szamlai-de0a5",
  storageBucket: "szamlai-de0a5.firebasestorage.app",
  messagingSenderId: "409260999478",
  appId: "1:409260999478:web:e7d2e344ddb2985983a997",
  measurementId: "G-L7T8KVYNSL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
