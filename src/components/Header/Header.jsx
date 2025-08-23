import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '/public/logo.png';
import pfp from '/public/pfp.png';
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import InboxRequestCard from '../InboxRequestCard/InboxRequestCard';


function Header(){
    const [friendRequests, setFriendRequests] = useState([]);
    const [authUser, setAuthUser] = useState(null);     // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null); // Firestore doc data
    const [loading, setLoading] = useState(true);

    const user = auth?.currentUser;
    // console.log(userPhoto);

    const [menuOpen, setMenuOpen] = useState(false);
    const [inboxOpen, setInboxOpen] = useState(false)


    const navigate = useNavigate(); //initialize usenavigate

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleMenu = () => {
        setInboxOpen(false);
        setMenuOpen((prev) => !prev);
    };

    const toggleInbox = () => {
        setInboxOpen((prev) => !prev);
        setMenuOpen(false);
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


    //fetch current user profile from firestore 
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

    // fetch user's friend request
    useEffect(() => {
        const fetchUserFriendRequests = async () => {
            if (!authUser) return;

            try {
                // Get all pending friend requests where current user is the receiver

                const requestsRef = collection(db, "friendRequests");
                const q = query(requestsRef, where("to", "==", authUser.uid));

                const querySnapshot = await getDocs(q);

                const requests = await Promise.all(
                    querySnapshot.docs.map(async (docSnap) => {
                        const data = docSnap.data();

                        // fetch sender's profile (from users collection)
                        const senderRef = doc(db, "users", data.from);
                        const senderSnap = await getDoc(senderRef);

                        return {
                            id: docSnap.id,
                            ...data,
                            senderName: senderSnap.exists()
                                ? senderSnap.data().username
                                : "Unknown User",
                            senderPhoto: senderSnap.exists()
                                ? senderSnap.data().photoURL
                                : null,
                            senderUid: senderSnap.exists()
                                ? senderSnap.data().uid
                                : null,
                        };
                    })
                );

                setFriendRequests(requests);
                console.log("Fetched pending requests:", requests);
            } catch (err) {
                console.error("Error fetching friend requests:", err);
            }
        };

        fetchUserFriendRequests();
    }, [authUser]);

    console.log(auth?.currentUser?.email);
    console.log(friendRequests)

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
                    <div>
                        <div className={styles.inboxwrapper}onClick={toggleInbox}>
                            {!loading && (
                                <div
                                className={styles.inboxlogo}
                                />
                            )}
                        </div>


                        {inboxOpen && (
                            <div className={styles.inboxdropdown}>
                                <h1>Inbox</h1>
                                {friendRequests.map((request) => <InboxRequestCard
                                                                    key={request.id}
                                                                    senderName={request.senderName}
                                                                    senderPhoto={request.senderPhoto}
                                                                    senderUid={request.senderUid}/>)}
                                {/* <button className={styles.dropdownItem} onClick={logOut}>Log Out</button> */}
                            </div>
                        )}
                    </div>

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