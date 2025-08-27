import Header from "../components/Header/Header.jsx";
import styles from './Home.module.css'
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";
import FriendCard from "../components/FriendCard/FriendCard.jsx";
import Post from "../components/Post/Post.jsx";
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
  deleteDoc,
  limit,
  onSnapshot,
  updateDoc,
  increment
} from "firebase/firestore";

function Home(){

    const [authUser, setAuthUser] = useState(null);     // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null); // Firestore doc data
    const [friendReccomendations, setFriendReccomendations] = useState([]); //friend reccomendation
    const [friends, setFriends] = useState([]); //user's friend
    const [isPosting, setIsPosting] = useState(false);
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); //initialize usenavigate

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const closePopup = () => {
        setIsPosting(false);
    };

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


    // send request
    async function sendFriendRequest(targetid) {
        if (!authUser) return;

        try {
            const requestsRef = collection(db, "friendRequests");

            // deterministic request ID (sender_to_receiver)
            const requestId = `${authUser.uid}_${targetid}`;
            const reverseRequestId = `${targetid}_${authUser.uid}`;

            const requestDoc = doc(requestsRef, requestId);
            const reverseRequestDoc = doc(requestsRef, reverseRequestId);

            // check if target already sent us a request
            const reverseSnap = await getDoc(reverseRequestDoc);

            if (reverseSnap.exists()) {
                console.log("Mutual friend request detected → creating friendship");

                // create friendship in both users' subcollections
                const userFriendRef = doc(db, "users", authUser.uid, "friends", targetid);
                const targetFriendRef = doc(db, "users", targetid, "friends", authUser.uid);

                await setDoc(userFriendRef, {
                    uid: targetid,
                    since: serverTimestamp()
                });

                await setDoc(targetFriendRef, {
                    uid: authUser.uid,
                    since: serverTimestamp()
                });

                // delete ONLY the reverse request (the one that exists)
                await deleteDoc(reverseRequestDoc);

                console.log("Friendship created with:", targetid);

                // update friendlist
                const targetProfileSnap = await getDoc(doc(db, "users", targetid));
                if (targetProfileSnap.exists()) {
                    const targetProfile = { id: targetid, ...targetProfileSnap.data() };
                    setFriends(prev => [...prev, targetProfile]);
                }
                setFriendReccomendations(prev =>
                    prev.filter(user => user.id !== targetid) // remove from recs
                );
            } else {
                // no reverse request → send normal friend request
                await setDoc(requestDoc, {
                    from: authUser.uid,
                    to: targetid,
                    timestamp: serverTimestamp()
                });

                console.log("Friend request sent to:", targetid);
            }

            // update UI state instantly
            setFriendReccomendations(prev =>
                prev.map(user =>
                    user.id === targetid ? { ...user, requestSent: true } : user
                )
            );
        } catch (err) {
            console.error("Error sending friend request:", err);
        }
    }
    // cancel request
    async function cancelFriendRequest(targetid) {
        if (!authUser) return;

        try {
            const requestsRef = collection(db, "friendRequests");
            const requestId = `${authUser.uid}_${targetid}`;
            const requestDoc = doc(requestsRef, requestId);

            await deleteDoc(requestDoc);

            console.log("Friend request cancelled for:", targetid);

            // update state instantly
            setFriendReccomendations(prev =>
                prev.map(user =>
                    user.id === targetid ? { ...user, requestSent: false } : user
                )
            );
        } catch (err) {
            console.error("Error cancelling friend request:", err);
        }
    }

    // remove friend
    async function removeFriend(targetid) {
        if (!authUser) return;

        try {
            // References to both users' friend subcollections
            const userFriendRef = doc(db, "users", authUser.uid, "friends", targetid);
            const targetFriendRef = doc(db, "users", targetid, "friends", authUser.uid);

            // Delete both documents
            await deleteDoc(userFriendRef);
            await deleteDoc(targetFriendRef);

            console.log("Friend removed:", targetid);

            // Update local state
            setFriends(prev => prev.filter(friend => friend.id !== targetid));

            // Optional: add removed user back to recommendations
            const targetProfileSnap = await getDoc(doc(db, "users", targetid));
            if (targetProfileSnap.exists()) {
                const targetProfile = { id: targetid, ...targetProfileSnap.data() };
                setFriendReccomendations(prev => [...prev, targetProfile]);
            }

        } catch (err) {
            console.error("Error removing friend:", err);
        }
    }

    //fetch posts
    useEffect(() => {
        if (!authUser) return;

        const fetchPosts = async () => {
            try {
                const postsRef = collection(db, "posts");
                const postsSnap = await getDocs(postsRef);

                const postsData = await Promise.all(
                    postsSnap.docs.map(async (docSnap) => {
                        const postData = docSnap.data();

                        // check if current user liked this post
                        const likeDocRef = doc(db, "posts", docSnap.id, "likes", authUser.uid);
                        const likeDocSnap = await getDoc(likeDocRef);
                        const currentUserLiked = likeDocSnap.exists();

                        return {
                            id: docSnap.id,
                            userId: postData.userId,
                            username: postData.username,
                            displayName: postData.displayName,
                            userPhotoURL: postData.userPhotoURL,
                            message: postData.message,
                            createdAt: postData.createdAt?.toDate().toLocaleString() || "Unknown",
                            likesAmount: postData.likesAmount || 0,
                            commentsAmount: postData.commentsAmount || 0,
                            currentUserLiked, // ✅ true/false
                        };
                    })
                );

                setPosts(postsData);
            } catch (err) {
                console.error("Error fetching posts:", err);
            }
        };

        fetchPosts();
    }, [authUser]);

    // like/unlike post
    async function likePost(postId) {
        if (!authUser) return;

        try {
            const postRef = doc(db, "posts", postId);
            const likeRef = doc(db, "posts", postId, "likes", authUser.uid);

            const likeSnap = await getDoc(likeRef);

            if (likeSnap.exists()) {
                // user already liked → unlike
                await deleteDoc(likeRef);
                await updateDoc(postRef, {
                    likesAmount: increment(-1),
                });
                console.log("Post unliked:", postId);

                // update local state instantly
                setPosts(prev =>
                    prev.map(post =>
                        post.id === postId
                            ? { ...post, likesAmount: post.likesAmount - 1, currentUserLiked: false }
                            : post
                    )
                );
            } else {
                // user hasn’t liked → like
                await setDoc(likeRef, {
                    userId: authUser.uid,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(postRef, {
                    likesAmount: increment(1),
                });
                console.log("Post liked:", postId);

                // update local state instantly
                setPosts(prev =>
                    prev.map(post =>
                        post.id === postId
                            ? { ...post, likesAmount: post.likesAmount + 1, currentUserLiked: true }
                            : post
                    )
                );
            }
        } catch (err) {
            console.error("Error liking/unliking post:", err);
        }
    }


    return(
        <>
            <div className={styles.container}>
                <div className={styles.contentcontainer}>
                    <div className={styles.userpostcontainer}>
                        {isPosting ? 
                            <div className={styles.overlay} onClick={closePopup}></div> 
                        : <></>}
                        <img src={userProfile !== null ? userProfile.photoURL : null} className={styles.userpostpfp}/>
                        <button>Whats on your mind, {userProfile !== null ? userProfile.displayName : "Loading.."} ?</button>
                    </div>
                    {console.log(posts)}
                    <div className={styles.postcontainer}>
                        <Post
                            username={"OriontDev"}
                            message={"lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit amet lorem ipsum dolor sit lorem ipsum dolor sit amet lorem ipsum dolor s lorem ipsum dolor s lorem ipsum dolor sit ametit ametit amet amet"}
                            createdAt={"24-20-12"}
                            likesAmount={21}
                            commentsAmount={20}/>
                        {posts.map((post) => <Post
                                                key={post.id}
                                                username={post.username}
                                                displayName={post.displayName}
                                                userId={post.userId}
                                                userPhotoURL={post.userPhotoURL}
                                                message={post.message}
                                                createdAt={post.createdAt}
                                                likesAmount={post.likesAmount}
                                                commentsAmount={post.commentsAmount}
                                                currentUserLiked={post.currentUserLiked}
                                                likeFunction={() => likePost(post.id)}
                                                redirectToPostPage={() => navigate(`/posts/${post.id}`)}
                                            />)}
                    </div>
                </div>
                <div className={styles.sidebarcontainer}>
                    <div className={styles.friendscontainer}>
                        <h1>Friends</h1>
                        {friends.length === 0 ? 
                            <h3>you dont have a friend lol</h3> :
                            friends.map((friend) =>
                                <FriendCard
                                    username={friend.username}
                                    photo={friend.photoURL}
                                    userid={friend.userId}
                                    key={friend.id}
                                    removeFunction={() => removeFriend(friend.userId)}/>
                            )}
                    </div>
                    <div className={styles.friendlistcontainer}>
                        {friendReccomendations.map((user) => <ProfileCard
                                                                key={user.id}
                                                                username={user.username}
                                                                photo={user.photoURL}
                                                                userid={user.id}
                                                                requestSent={user.requestSent}
                                                                sendFriendRequestFunc={() => sendFriendRequest(user.id)}
                                                                cancelFriendRequestFunc={() => cancelFriendRequest(user.id)}
                                                            />)}
                    </div>

                </div>
            </div>
        </>
    );
}

export default Home