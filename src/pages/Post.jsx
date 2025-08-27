import Header from "../components/Header/Header.jsx";
import styles from './Post.module.css';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
  setDoc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import FriendCard from "../components/FriendCard/FriendCard.jsx";
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";

function Post() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  //initialize with location.state (fast path)
  const [postData, setPostData] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendReccomendations, setFriendReccomendations] = useState([]);
  const [loading, setLoading] = useState(true);

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



    // fetch the current post data
    useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
        try {
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            setPostData({ id: postSnap.id, ...postSnap.data() });
            console.log("✅ Post data:", postSnap.data());
        } else {
            console.warn("⚠️ No such post found");
            navigate('/error' ,{state: {invalidPost: true}});
        }
        } catch (err) {
        console.error("Error fetching post:", err);
        }
    };

    fetchPost();
    }, [id]);



  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <Header/>
      <div className={styles.container}>
        <div className={styles.contentcontainer}>
          <div className={styles.headercontainer}>
                a
          </div>
        </div>

        <div className={styles.sidebarcontainer}>
          <div className={styles.friendscontainer}>
            <h1>Friends</h1>
            {friends.length === 0 ? (
              <h3>you dont have a friend lol</h3>
            ) : (
              friends.map((friend) =>
                <FriendCard
                  username={friend.username}
                  photo={friend.photoURL}
                  userid={friend.id}
                  key={friend.id}
                  removeFunction={() => removeFriend(friend.id)}
                />
              )
            )}
          </div>
          <div className={styles.friendlistcontainer}>
            {friendReccomendations.map((user) =>
              <ProfileCard
                key={user.id}
                username={user.username}
                photo={user.photoURL}
                userid={user.id}
                requestSent={user.requestSent}
                sendFriendRequestFunc={() => sendFriendRequest(user.id)}
                cancelFriendRequestFunc={() => cancelFriendRequest(user.id)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
