import styles from './ResetPassword.module.css'
import { auth, googleProvider, db } from "../config/firebase"
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import {
  getDocs,
  collection,
  doc,
  query, 
  where,
  setDoc
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from 'react';



function ResetPassword(){

    const defaultPfps = [
        "/pfp1.svg",
        "/pfp2.svg",
        "/pfp3.svg",
        "/pfp4.svg"
    ];

    // Allowed characters: letters, numbers, underscore, and dot
    const usersCollectionRef = collection(db, "users");
    const navigate = useNavigate(); //initialize usenavigate

    //For email login
    const [email, setEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [cooldown, setCooldown] = useState(0); // in seconds

    function printError(type){
        if (type === "unexist"){
            setErrorMsg("incorrect email/password/provider!")
        }else if(type === "notfull"){
            setErrorMsg("please fill the column")
        }else if(type === "nouser"){
            setErrorMsg("No user are logged with that email!")
        }else if(type === "google"){
            setErrorMsg("This user is logged with Google!")
        }
        else{
            setErrorMsg("Something went wrong")
        }
    }

    async function sendResetEmail(){
        if(email === "") { printError("notfull"); return; }

        try {
            const cleanEmail = email.trim().toLowerCase();
            const qe = query(usersCollectionRef, where("email", "==", cleanEmail));
            const querySnapshot = await getDocs(qe);

            if (querySnapshot.empty) {
                printError("nouser");
                return;
            }

            // We expect only one user doc per email
            const userDoc = querySnapshot.docs[0].data();

            if (userDoc.provider === "google") {
                printError("google");
                return;
            }

            if (userDoc.provider === "email") {
                await sendPasswordResetEmail(auth, cleanEmail);
                setCooldown(30);
                setErrorMsg("");
                return;
            }

            // fallback
            printError("unexist");

        } catch (err) {
            console.error("Reset error:", err);
            printError("soething");
        }
    }

    // Timer effect
    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    return(
        <>
            <div className={styles.background}>
                <div className={styles.container1}>
                    <h1 className={styles.title}>DevDome</h1>
                    <h1 className={styles.slogan}>Showcase. Collaborate. Elevate</h1>
                </div>
                <div className={styles.container2}>
                    <div>
                        <h1 className={styles.registertitle}>Reset Password</h1>
                        <h1 className={styles.registerdescription}>If you logged with google, please use the login with google option on the login page instead.</h1>
                    </div>
                    <p className={styles.error}>{errorMsg}</p>
                    <input type='text' placeholder='Insert Your Email' value={email} onChange={(e) => {setEmail(e.target.value); setErrorMsg("");}}></input>

                    {/* disable button during cooldown */}
                    <button className={styles.signinbutton} onClick={sendResetEmail} disabled={cooldown > 0}>
                        {cooldown > 0 ? `Email sent! Wait ${cooldown}s to resend` : "Send Email"}
                    </button>
                    
                    <hr/>
                    <button className={styles.loginbutton} onClick={() => navigate('/')}>Return to login page</button>
                </div>
            </div>
        </>
    );
}

export default ResetPassword