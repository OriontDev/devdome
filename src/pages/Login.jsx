import styles from './Login.module.css'
import google from '/google.svg'
import { auth, googleProvider, db } from "../config/firebase"

import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query, 
  where,
  setDoc
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";



function Login(){

    const createdAt = serverTimestamp();
    const usersCollectionRef = collection(db, "users");
    const navigate = useNavigate(); //initialize usenavigate
    const user = auth?.currentUser;

    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = auth.currentUser;

            // Check if user already exists
            const q = query(usersCollectionRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // User doesn't exist yet → add new document
                await setDoc(doc(db, "users", user.uid), {
                    displayName: user.displayName,
                    bio: `Hello! I'm ${user.displayName}`,
                    createdAt: serverTimestamp(),
                    email: user.email,
                    photoURL: user.photoURL,
                    github: "",
                    linkedin: "",
                    x: "",
                    personalWebsite: "",
                    userId: user.uid,
                });
                console.log("User added to database");
            } else {
                console.log("User already exists in database");
            }

            navigate("/home");

        } catch (err) {
            console.error(err);
        }
    }


    console.log(auth?.currentUser?.email);

    return(
        <>
            <div className={styles.background}>
                <div className={styles.container1}>
                    <h1 className={styles.title}>DevDome</h1>
                    <h1 className={styles.slogan}>Showcase. Collaborate. Elevate</h1>
                </div>
                <div className={styles.container2}>
                    <input type='text' placeholder='Insert Email'></input>
                    <input type='text' placeholder='Insert Password'></input>
                    <button className={styles.loginbutton}>Login</button>
                    <button className={styles.googlebutton} onClick={signInWithGoogle}>Login with <img src={google} className={styles.googlelogo}/></button>
                    
                    <hr/>
                    <br/>
                    <button className={styles.signinbutton}>Create a new account</button>
                </div>
            </div>
        </>
    );
}

export default Login