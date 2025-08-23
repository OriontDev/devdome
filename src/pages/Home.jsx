import Header from "../components/Header/Header.jsx";
import styles from './Home.module.css'
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";
import InboxRequestCard from "../components/InboxRequestCard/InboxRequestCard.jsx";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  getDocs,
  getDoc,
  collection,
  doc,
  query, 
  where,
  setDoc,
  serverTimestamp,
  limit
} from "firebase/firestore";


function Home(){

    const [authUser, setAuthUser] = useState(null);     // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null); // Firestore doc data
    const [friendReccomendations, setFriendReccomendations] = useState([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); //initialize usenavigate

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // fetch userprofile
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

    // fetch friend recommendations (max 10)
    useEffect(() => {
        const fetchFriendRecommendations = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, limit(10)); // fetch at most 10 users

                const querySnapshot = await getDocs(q);

                const users = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    // filter out current user from recommendations
                    .filter(user => user.id !== authUser?.uid);

                setFriendReccomendations(users);
                console.log("Friend recommendations:", users);
            } catch (err) {
                console.error("Error fetching friend recommendations:", err);
            }
        };

        if (authUser) fetchFriendRecommendations();
    }, [authUser]);

    return(
        <>
            <Header/>
            <div className={styles.container}>
                <div className={styles.contentcontainer}>c</div>
                <div className={styles.sidebarcontainer}>
                    <div className={styles.friendscontainer}>
                        <h1>Friends</h1>
                        <h3>you dont have a friend lol</h3>
                    </div>
                    <div className={styles.friendlistcontainer}>
                        {friendReccomendations.map((user) => <ProfileCard
                                                                key={user.id}
                                                                username={user.username}
                                                                photo={user.photoURL}
                                                                userid={user.id}
                                                            />)}
                    </div>

                </div>
            </div>
        </>
    );
}

export default Home