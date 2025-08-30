import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '/public/logo.png';

import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import pfp from '/public/pfp.png';
import { setDoc, doc, getDoc, query, collection, where, serverTimestamp, onSnapshot, deleteDoc } from "firebase/firestore";
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
        if (!authUser) return;
        const requestsRef = collection(db, "friendRequests");
        const q = query(requestsRef, where("to", "==", authUser.uid));

        //onSnapshot is a real-time listener.
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const requests = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    //fetch sender acc information
                    const senderSnap = await getDoc(doc(db, "users", data.from));
                    return {
                        id: docSnap.id,
                        ...data,
                        senderName: senderSnap.exists() ? senderSnap.data().username : "Unknown User",
                        senderPhoto: senderSnap.exists() ? senderSnap.data().photoURL : null,
                        senderUid: senderSnap.exists() ? senderSnap.data().uid : null,
                    };
            })
        );
        setFriendRequests(requests);
    });
        return () => unsubscribe();
    }, [authUser]);


    // Accept friend request
    async function acceptRequest(requestId) {
        if (!authUser) return;

        try {
            const requestDoc = doc(db, "friendRequests", requestId);
            const requestSnap = await getDoc(requestDoc);
            if (!requestSnap.exists()) return;

            const senderUid = requestSnap.data().from;

            // Create friendship
            const userFriendRef = doc(db, "users", authUser.uid, "friends", senderUid);
            const senderFriendRef = doc(db, "users", senderUid, "friends", authUser.uid);

            await setDoc(userFriendRef, { uid: senderUid, since: serverTimestamp() });
            await setDoc(senderFriendRef, { uid: authUser.uid, since: serverTimestamp() });

            // Delete request
            await deleteDoc(requestDoc);

            // Update UI
            setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err) {
            console.error(err);
        }
    }

    async function rejectRequest(requestId) {
        if (!authUser) return;

        try {
            const requestDoc = doc(db, "friendRequests", requestId);
            await deleteDoc(requestDoc);
            setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err) {
            console.error(err);
        }
    }


    // console.log(auth?.currentUser?.email);
    // console.log(friendRequests)

    return(
        <>
            <div className={styles.header}>
                <div className={styles.leftheader}>
                    <img className={styles.logo} src={logo} onClick={() => navigate("/home")}/>
                    <h1 className={styles.title} onClick={() => navigate("/home")}>DevDome</h1>
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
                                                                    senderUid={request.senderUid}
                                                                    acceptFunction={() => acceptRequest(request.id)}
                                                                    rejectFunction={() => rejectRequest(request.id)}
                                                                />)}
                                {/* <button className={styles.dropdownItem} onClick={logOut}>Log Out</button> */}
                            </div>
                        )}
                    </div>

                    <div className={styles.profileWrapper}>
                        {!loading ? (
                            <img
                            className={styles.profilepicture}
                            src={userProfile?.photoURL}
                            onClick={toggleMenu}
                            />
                        ) : <img
                                className={styles.profilepicture}
                                src={pfp}
                            />}
                        
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