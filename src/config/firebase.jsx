
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCN8xDtPY1JdropNq7HI1TJonknMaRaqaY",
  authDomain: "devdome-4f2bd.firebaseapp.com",
  projectId: "devdome-4f2bd",
  storageBucket: "devdome-4f2bd.firebasestorage.app",
  messagingSenderId: "412928422309",
  appId: "1:412928422309:web:b2420c0e20eb5f3005b84c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);