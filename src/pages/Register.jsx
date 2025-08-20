import styles from './Register.module.css'
import google from '/google.svg'
import { auth, googleProvider, db } from "../config/firebase"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, signOut, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import {
  getDocs,
  collection,
  doc,
  query, 
  where,
  setDoc
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { useState } from 'react';



function Login(){

    const defaultPfps = [
        "/pfp1.svg",
        "/pfp2.svg",
        "/pfp3.svg",
        "/pfp4.svg"
    ];

    const usersCollectionRef = collection(db, "users");
    const navigate = useNavigate(); //initialize usenavigate

    //For email login
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setname] = useState("");
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
        }
        else{
            setErrorMsg("Something went wrong")
        }
    }

    //login with email
    async function logInEmail(){
        if(email === "" && password === ""){printError("noboth"); return;}
        if(email === ""){printError("noemail"); return;}
        if(password === ""){printError("nopass"); return;}
        try{
            const q = query(usersCollectionRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if(querySnapshot.empty){
                printError("unexist");
            }else{
                console.log("logging in..");
                printError("clear");
                await signInWithEmailAndPassword(auth, email, password);
                // await createUserWithEmailAndPassword(auth, email, password);
            }
            
        } catch (err){
            console.err(err);
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
                    <div>
                        <h1 className={styles.registertitle}>Create an account</h1>
                        <h1 className={styles.registerdescription}>It's quick and easy</h1>
                    </div>
                    <p className={styles.error}>{errorMsg}</p>
                    <input type='text' placeholder='Insert Email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                    <input type='password' placeholder='Insert Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <button className={styles.loginbutton} onClick={logInEmail}>Login</button>
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