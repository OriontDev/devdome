import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '/public/logo.png';
import pfp from '/public/pfp.png';
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

function Header(){
    const [authUser, setAuthUser] = useState(null);     // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null); // Firestore doc data
    const [loading, setLoading] = useState(true);

    const user = auth?.currentUser;
    // console.log(userPhoto);

    const [menuOpen, setMenuOpen] = useState(false)


    const navigate = useNavigate(); //initialize usenavigate

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    async function logOut(){
        try{
            await signOut(auth);
            console.log(auth?.currentUser?.email);
            navigate("/");
        } catch (err){
            console.err(err);
        }
    };


    //fetch user pfp from firestore 
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authUser) return;
            const docRef = doc(db, "users", authUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            } else {
                console.log("failed fetching data for setUserProfile")
            }
        };

        fetchUserProfile();
    }, [authUser]);

    console.log(auth?.currentUser?.email);

    return(
        <>
            <div className={styles.header}>
                <div className={styles.leftheader}>
                    <img className={styles.logo} src={logo} onClick={() => navigate("/home")}/>
                    <h1 className={styles.title}>DevDome</h1>
                </div>
                <div className={styles.centerheader}>
                    <img className={styles.logo} src={logo}/>
                </div>
                <div className={styles.rightheader}>
                    <div className={styles.profileWrapper}>
                        {!loading && (
                            <img
                            className={styles.profilepicture}
                            src={userProfile?.photoURL}
                            onClick={toggleMenu}
                            />
                        )}
                        {menuOpen && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownItemCard} onClick={() => navigate(`/account/${auth.currentUser.uid}`)}>
                                <img src={userProfile?.photoURL} className={styles.dropdownpfp}/>
                                <h1 className={styles.dropdownuser}>{userProfile.displayName || "User"}</h1>
                            </div>
                            <div className={styles.dropdownItem} onClick={logOut}>
                                <div className={styles.dropdownlogocontainer}>
                                    <div className={styles.logouticon}></div>
                                </div>
                                <h2>Log out</h2>
                            </div>
                            {/* <button className={styles.dropdownItem} onClick={logOut}>Log Out</button> */}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header