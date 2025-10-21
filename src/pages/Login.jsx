import styles from './Login.module.css'
import google from '/google.svg'
import { auth, googleProvider, db } from "../config/firebase"
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut, fetchSignInMethodsForEmail, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {
  getDocs,
  collection,
  doc,
  query, 
  where,
  setDoc
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from 'react';



function Login(){

    const navigate = useNavigate(); //initialize usenavigate
    //prevent people who authed to go back to login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // If already logged in, redirect to home
                navigate("/home");
            }
        });

        return () => unsubscribe(); // cleanup on unmount
    }, [navigate]);

    const defaultPfps = [
        "/pfp1.svg",
        "/pfp2.svg",
        "/pfp3.svg",
        "/pfp4.svg"
    ];

    const usersCollectionRef = collection(db, "users");


    //For email login
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function signInWithGoogle() {
        try {
            // const result = await signInWithPopup(auth, googleProvider);
            await signInWithPopup(auth, googleProvider);
            const user = auth.currentUser;

            // Check if user already exists
            const q = query(usersCollectionRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {

                const assignedPfp = defaultPfps[Math.floor(Math.random() * defaultPfps.length)];
                // User doesn't exist yet → add new document
                await setDoc(doc(db, "users", user.uid), {
                    displayName: user.displayName,
                    bio: `Hello! I'm ${user.displayName}`,
                    createdAt: serverTimestamp(),
                    email: user.email,
                    photoURL: assignedPfp,
                    github: "",
                    linkedin: "",
                    x: "",
                    personalWebsite: "",
                    userId: user.uid,
                    provider: "google",
                    username: user.displayName.slice(0, 20)
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

    function printError(type){
        if (type === "unexist"){
            setErrorMsg("incorrect email/password/provider!")
        }else if(type === "nopass"){
            setErrorMsg("please fill the password!")
        }else if(type === "noemail"){
            setErrorMsg("please fill the email!")
        }else if(type === "noboth"){
            setErrorMsg("please fill the email & password!")
        }else if(type === "clear"){
            setErrorMsg("")
        }else if(type === "authfail"){
            setErrorMsg("Auth failed!")
        }
        else{
            setErrorMsg("Something went wrong")
        }
    }

    //login with email
    async function logInEmail(){
        if(email === "" && password === ""){
            printError("noboth"); return;
        }
        if(email === ""){
            printError("noemail"); return;
        }
        if(password === ""){
            printError("nopass"); return;
        }

        try {
            // First check if input matches an email
            const q = query(usersCollectionRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Input is an email -> login directly
                await signInWithEmailAndPassword(auth, email, password);
                console.log("logging in with email..");
                printError("clear");
                navigate('/home');
                return;
            }

            // If not found, check if it's a username
            const qu = query(usersCollectionRef, where("username", "==", email));
            const querySnapshot2 = await getDocs(qu);

            if (!querySnapshot2.empty) {
                // Get email from username
                const userDoc = querySnapshot2.docs[0];
                const userData = userDoc.data();
                const realEmail = userData.email;

                await signInWithEmailAndPassword(auth, realEmail, password);
                console.log("logging in with username..");
                printError("clear");
                navigate('/home');
                return;
            }

            // If neither email nor username exists
            printError("unexist");

        } catch (err) {
            console.error(err);
            printError("authfail"); // optional: handle auth error
        }
    };


    console.log(auth?.currentUser?.email);

    return(
        <>
            <div className={styles.background}>
                <div className={styles.container1}>
                    <h1 className={styles.title}>DevDome</h1>
                    <h1 className={styles.slogan}>Showcase. Collaborate. Elevate</h1>
                </div>
                <div className={styles.container2}>
                    <p className={styles.error}>{errorMsg}</p>
                    <input type='text' placeholder='Insert Email/Username' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                    <input type='password' placeholder='Insert Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <button className={styles.loginbutton} onClick={logInEmail}>Login</button>
                    <button className={styles.forgotpasswordbutton} onClick={() => navigate("/reset")}>Forgot password?</button>
                    
                    <hr/>
                    <br/>
                    <button className={styles.googlebutton} onClick={signInWithGoogle}>Login with <img src={google} className={styles.googlelogo}/></button>
                    <button className={styles.signinbutton} onClick={() => navigate("/register")}>Create a new account</button>
                </div>
            </div>
        </>
    );
}

export default Login