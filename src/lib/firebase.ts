import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "trithon-e6073.firebaseapp.com",
    projectId: "trithon-e6073",
    storageBucket: "trithon-e6073.firebasestorage.app",
    messagingSenderId: "889783456532",
    appId: "1:889783456532:web:004b8cb6de1d06f7656801",
    measurementId: "G-RG6SQYLV4E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
