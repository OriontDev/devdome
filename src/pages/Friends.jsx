import styles from './Friends.module.css'
import { doc, getDoc, getDocs, setDoc, collection, onSnapshot, query, limit, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import FriendCard from '../components/FriendCard/FriendCard';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import { auth, db } from "../config/firebase";

function Friends(){
    const [authUser, setAuthUser] = useState(null);
    const [friendReccomendations, setFriendReccomendations] = useState([]); //friend reccomendation
    const [friends, setFriends] = useState([]); //user's friend
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState("Reccomendations");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    // fetch friend recommendations (max 10)
    useEffect(() => {
        const fetchFriendRecommendations = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, limit(10)); // fetch at most 10 users

                const querySnapshot = await getDocs(q);

                // fetch friend requests sent by current user
                const requestsRef = collection(db, "friendRequests");
                const requestsQuery = query(requestsRef, where("from", "==", authUser.uid));
                const requestsSnapshot = await getDocs(requestsQuery);
                const sentRequestUIDs = requestsSnapshot.docs.map(doc => doc.data().to);

                const users = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    // filter out current user from recommendations
                    .filter(user => user.id !== authUser?.uid)
                    // filter out users we are already friends with
                    .filter(user => !friends.some(friend => friend.id === user.id))
                    // add request sent property (later used in rendering profilecard)
                    .map(user => ({
                        ...user,
                        requestSent: sentRequestUIDs.includes(user.id) // true if request already sent
                    }));

                setFriendReccomendations(users);
                console.log("Friend recommendations:", users);
            } catch (err) {
                console.error("Error fetching friend recommendations:", err);
            }
        };

        if (authUser) fetchFriendRecommendations();
    }, [authUser, friends]);

    // fetch user's friends
    // real-time listener for user's friends with onsnapshot
    useEffect(() => {
        if (!authUser) return;

        const friendsRef = collection(db, "users", authUser.uid, "friends");
        const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
            const friendsData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const friendRef = doc(db, "users", data.uid);
                    const friendSnap = await getDoc(friendRef);
                    return friendSnap.exists()
                        ? { id: friendSnap.id, ...friendSnap.data() }
                        : null;
                })
            );
            setFriends(friendsData.filter(Boolean));
        });

        return () => unsubscribe();
    }, [authUser]);

    console.log(friends)

    return(
        <>
            <div className={styles.mainContainer}>
                <div className={styles.subContainer}>
                    <h1>Friends</h1>
                    <div className={styles.friendFilterContainer}>
                        <button className={styles.filterButton} onClick={() => setFilterMode("List")}>List</button>
                        <button className={styles.filterButton} onClick={() => setFilterMode("Reccomendations")}>Reccomendations</button>
                    </div>

                    <div className={styles.friendsContainer}>
                        {filterMode === "List" &&
                            <>
                                {friends.length === 0 ? 
                                    <h3>you dont have a friend lol</h3> :
                                    friends.map((friend) =>
                                        <div className={styles.friendCardContainer}>
                                            <FriendCard
                                                username={friend.username}
                                                photo={friend.photoURL}
                                                userid={friend.userId}
                                                key={friend.id}
                                                removeFunction={() => removeFriend(friend.userId)}
                                            />
                                        </div>
                                )}
                            </>
                        }
                        {filterMode === "Reccomendations" &&
                            <>
                                {friendReccomendations.map((user) => <div className={styles.friendCardContainer}><ProfileCard
                                                                            key={user.id}
                                                                            username={user.username}
                                                                            photo={user.photoURL}
                                                                            userid={user.id}
                                                                            requestSent={user.requestSent}
                                                                            sendFriendRequestFunc={() => sendFriendRequest(user.id)}
                                                                            cancelFriendRequestFunc={() => cancelFriendRequest(user.id)}
                                                                        /></div>)
                                }
                            </>
                        }

                    </div>


                </div>
            </div>
        </>
    )
}

export default Friends