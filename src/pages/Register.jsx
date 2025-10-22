import styles from './Register.module.css'
import { auth, googleProvider, db } from "../config/firebase"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
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



function Register(){
    const defaultPfps = [
        "/pfp1.svg",
        "/pfp2.svg",
        "/pfp3.svg",
        "/pfp4.svg"
    ];

    // Allowed characters: letters, numbers, underscore, and dot
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    const usersCollectionRef = collection(db, "users");
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

    //For email login
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [copassword, setCopassword] = useState("");
    const [name, setName] = useState("");
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
        }else if(type === "notfull"){
            setErrorMsg("please fill all the columns")
        }else if(type === "notmatch"){
            setErrorMsg("passwords doesn't match!")
        }else if(type === "used"){
            setErrorMsg("this email has already been used!")
        }else if(type === "clear"){
            setErrorMsg("")
        }else if(type === "takenuser"){
            setErrorMsg("this username is taken!")
        }else if(type === "longuser"){
            setErrorMsg("Username cant be longer than 20 letter!")
        }else if(type === "invalidsymbols"){
            setErrorMsg("Usernamae contains forbidden symbols!")
        }else if(type === "shortpass"){
            setErrorMsg("Password has to be atleast 7 letter!")
        }
        else{
            setErrorMsg("Something went wrong")
        }
    }

    async function handleSignIn(){
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const assignedPfp = defaultPfps[Math.floor(Math.random() * defaultPfps.length)];
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            displayName: name,
            bio: `Hello! I'm ${name}`,
            createdAt: serverTimestamp(),
            email: email,
            photoURL: assignedPfp,
            github: "",
            linkedin: "",
            x: "",
            personalWebsite: "",
            userId: user.uid,
            provider: "email"
        });
        console.log("User added to database");
        navigate("/home");
    }

    //login with email
    async function signInEmail(){
        if(email === "" || password === "" || name === "" || copassword === ""){printError("notfull"); return;}
        if(password !== copassword){printError("notmatch"); return;}
        if(password.length < 7){printError("shortpass"); return;}
        try{
            //check if email already used
            const qe = query(usersCollectionRef, where("email", "==", email));
            const querySnapshot = await getDocs(qe);

            //check if username is already used
            const qu = query(usersCollectionRef, where("username", "==", username));
            const querySnapshot2 = await getDocs(qu);

            if(querySnapshot.empty){
                if(querySnapshot2.empty){
                    if(username.length < 21){
                        if (usernameRegex.test(username)) {
                            console.log("logging in..");
                            printError("clear");
                            await handleSignIn();//actually signs in
                        } else {
                            // username contains forbidden symbols
                            printError("invalidsymbols");
                        }
                    }else{
                        //username too long
                        printError("longuser");                   
                    }
                }else{
                    //username taken
                    printError("takenuser");
                }
            }else{
                //email used
                printError("used");
            }
            
        } catch (err){
            console.error(err);
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
                    <input type='text' placeholder='Insert username' value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <input type='text' placeholder='Insert Your Name' value={name} onChange={(e) => setName(e.target.value)}></input>
                    <input type='text' placeholder='Insert Email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                    <input type='password' placeholder='Insert Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <input type='password' placeholder='Confirm Password' value={copassword} onChange={(e) => setCopassword(e.target.value)}></input>
                    <button className={styles.signinbutton} onClick={signInEmail}>Create a new account</button>
                    
                    <hr/>
                        <h1 className={styles.registerdescription}>Already have an account?</h1>
                    <button className={styles.loginbutton} onClick={() => navigate('/')}>Return to login page</button>
                </div>
            </div>
        </>
    );
}

export default Register