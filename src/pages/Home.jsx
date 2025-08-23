import Header from "../components/Header/Header.jsx";
import styles from './Home.module.css'
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";


function Home(){

    const [authUser, setAuthUser] = useState(null);     // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null); // Firestore doc data
    const [showFriendList, setShowFriendList] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); //initialize usenavigate

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authUser) return;
            const docRef = doc(db, "users", authUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            } else {
                console.log("failed fetching data for setUserProfile")
                navigate('/');
            }
        };

        fetchUserProfile();
    }, [authUser]);

    return(
        <>
            <Header/>
            <div className={styles.container}>
                <div className={styles.contentcontainer}>c</div>
                <div className={styles.sidebarcontainer}>
                    <div className={styles.friendscontainer}>
                        <h1>Friends</h1>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                    </div>
                    <div className={styles.friendlistcontainer}>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                        <ProfileCard/>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Home