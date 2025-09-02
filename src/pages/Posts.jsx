
import styles from './Posts.module.css';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase.jsx";
import pfp from '/public/pfp.png';
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  where,
  limit,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc
} from "firebase/firestore";
import Comment from '../components/Comment/Comment.jsx';
import FriendCard from "../components/FriendCard/FriendCard.jsx";
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";

function Posts() {
  const { id } = useParams(); 
  const navigate = useNavigate();


    const [editDropdownOpen, setEditDropdownOpen] = useState(false);
    const [userCommentInput, setUserCommentInput] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);


    const [isOwner, setIsOwner] = useState(false);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null); //Ref for dropdown



  //initialize with location.state (fast path)
    const [postData, setPostData] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendReccomendations, setFriendReccomendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserLiked, setCurrentUserLiked] = useState(false);

    const [comments, setComments] = useState([]);

    const userCommentChange = (e) => {
        setUserCommentInput(e.target.value);

        // Reset height to auto first to shrink if needed
        textareaRef.current.style.height = "auto";
        // Set height to scrollHeight so it fits content
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto"; // reset to shrink if text deleted
        textarea.style.height = textarea.scrollHeight + "px"; // fit content
    };

    useEffect(() => {
        adjustHeight(); // adjust when component mounts
    }, []);


    async function postComment(){
        if (!authUser) return;

        const commentsCollectionRef = collection(db, "posts", id, "comments");

        // New comment data
        const newComment = {
            userId: authUser.uid,
            text: userCommentInput,
            createdAt: serverTimestamp(),
            edited: false,
            parentCommentId: null, // top-level comment
            likesAmount: 0
        };

        // Add comment to Firestore
        const commentDoc = await addDoc(commentsCollectionRef, newComment);

        // Increment post's commentsAmount
        const postRef = doc(db, "posts", id);
        await updateDoc(postRef, { commentsAmount: increment(1) });

        // Reset input + textarea height
        setUserCommentInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        // Optimistic update: add it into local state
        setComments(prev => [
            {
                id: commentDoc.id,
                ...newComment,
                createdAt: new Date(), // show as "just now"
                user: {
                    username: userProfile.username,
                    photoURL: userProfile.photoURL
                },
                replies: []
            },
            ...prev
        ]);

        // Also update the postData.commentsAmount locally
        setPostData(prev => prev ? { ...prev, commentsAmount: prev.commentsAmount + 1 } : prev);

    }



    //close dropdown if user click outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
        // If dropdown is open and click target is outside → close
        if (editDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setEditDropdownOpen(false);
        }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editDropdownOpen]);

    //fetch auth user
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
                // console.log("Friend recommendations:", users);
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
                setCurrentUserLiked(false); // ✅ toggle state
                setPostData(prev => prev ? { ...prev, likesAmount: prev.likesAmount - 1 } : prev);
                console.log("Post unliked:", postId);
            } else {
                // user hasn’t liked → like
                await setDoc(likeRef, {
                    userId: authUser.uid,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(postRef, {
                    likesAmount: increment(1),
                });
                setCurrentUserLiked(true); // ✅ toggle state
                setPostData(prev => prev ? { ...prev, likesAmount: prev.likesAmount + 1 } : prev);
                console.log("Post liked:", postId);

            }
        } catch (err) {
            console.error("Error liking/unliking post:", err);
        }
    }

    useEffect(() => {
        if (!id || !authUser) return;

        const fetchPost = async () => {
            try {
                const postRef = doc(db, "posts", id);
                const postSnap = await getDoc(postRef);

                if (!postSnap.exists()) {
                    console.warn("⚠️ No such post found");
                    navigate('/error', { state: { invalidPost: true } });
                    return;
                }

                const data = postSnap.data();

                //get post owner data
                const userRef = doc(db, "users", data.userId);
                const userDataSnap = await getDoc(userRef);
                let userData = null;
                if(userDataSnap.exists()){
                    userData = userDataSnap.data();
                }


                setPostData({
                    id: postSnap.id,
                    username: userData?.username,
                    displayName: userData?.displayName,
                    userPhotoURL: userData?.photoURL,
                    ...data,
                    createdAt: data.createdAt?.toDate().toLocaleString() || null,
                });

                const userLikedRef = doc(db, "posts", id, "likes", authUser.uid)
                const userLikedSnap = await getDoc(userLikedRef)
                setCurrentUserLiked(userLikedSnap.exists());

            } catch (err) {
                console.error("Error fetching post:", err);
            }
        };

        fetchPost();
    }, [id, authUser, navigate]);

    //Check if the post is ours or not
    useEffect(() => {
    if (authUser && postData) { //if authuser and postdata already exist
        setIsOwner(authUser.uid === postData.userId); //setIsOwner to wether the user uid from those two match
    } else {
        setIsOwner(false);
    }
    }, [authUser, postData, id]);

    //fetch comment (still modifying)
    useEffect(() => {
        if (!authUser || !postData?.id) return;

        const fetchComments = async () => {
            try {
                const commentsRef = collection(db, "posts", postData.id, "comments");
                const commentsSnap = await getDocs(commentsRef);

                // Get raw comments data
                const allComments = commentsSnap.docs.map(docSnap => {
                    const commentData = docSnap.data();
                    return {
                        id: docSnap.id,
                        userId: commentData.userId,
                        text: commentData.text,
                        edited: commentData.edited,
                        parentCommentId: commentData.parentCommentId || null,
                        createdAt: commentData.createdAt?.toDate() || "Unknown",
                        likesAmount: commentData.likesAmount || 0,
                    };
                });

                // Fetch user info for each unique userId
                const uniqueUserIds = [...new Set(allComments.map(c => c.userId))];
                const userDocs = await Promise.all(
                    uniqueUserIds.map(async (uid) => {
                        const userRef = doc(db, "users", uid);
                        const userSnap = await getDoc(userRef);
                        return userSnap.exists()
                            ? { id: uid, ...userSnap.data() }
                            : { id: uid, username: "Unknown", photoURL: null };
                    })
                );

                // Map userId → userData
                const userMap = {};
                userDocs.forEach(u => {
                    userMap[u.id] = {
                        username: u.username,
                        photoURL: u.photoURL
                    };
                });

                // Attach user info to comments
                const allCommentsWithUser = allComments.map(c => ({
                    ...c,
                    user: userMap[c.userId] || { username: "Unknown", photoURL: null }
                }));

                // Split into top-level and replies
                const topLevelComments = allCommentsWithUser
                    .filter(c => c.parentCommentId === null)
                    .map(c => ({ ...c, replies: [] }));

                const replies = allCommentsWithUser.filter(c => c.parentCommentId !== null);

                // Attach replies to their parent comment
                replies.forEach(reply => {
                    const parent = topLevelComments.find(c => c.id === reply.parentCommentId);
                    if (parent) {
                        parent.replies.push({
                            ...reply,
                            createdAt: timeAgo(reply.createdAt)});
                    }
                });

                setComments(topLevelComments);
                // console.log(allCommentsWithUser);

            } catch (err) {
                console.error("Error fetching comments:", err);
            }
        };

        fetchComments();
    }, [authUser, postData]);

    //change the createdAt into ... second/minute/hour/etc ago 
    function timeAgo(date) {
        if (!(date instanceof Date)) return "Unknown";

        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

        if (seconds < 60) return rtf.format(-seconds, "second");

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return rtf.format(-minutes, "minute");

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return rtf.format(-hours, "hour");

        const days = Math.floor(hours / 24);
        if (days < 30) return rtf.format(-days, "day");
        
        const months = Math.floor(days / 30);
        if (months < 12) return rtf.format(-months, "month");
        const years = Math.floor(months / 12);
        return rtf.format(-years, "year");
    }



    if (loading) return <p>Loading... page</p>;
    if(postData === null) return <p>Loading... post</p>

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentcontainer}>
          <div className={styles.headercontainer}>
                <img src={postData !== null ? postData.userPhotoURL : pfp} className={styles.headerpfp}/>
                <div className={styles.titlecontainer}>
                    <p>@{postData !== null ? postData.username : "Loading"} - {postData !== null ? postData.displayName : "Loading"}</p>
                    <p>{postData !== null ? postData.createdAt : "Loading"}</p>
                </div>
                <div className={styles.headerbuttoncontainer}>
                    <div className={styles.settingiconcontainer} onClick={() => setEditDropdownOpen(prev => !prev)}>
                        <div className={styles.settingicon}></div>
                    </div>
                    {editDropdownOpen && (
                    <div ref={dropdownRef} className={styles.dropdown}>
                        {isOwner ? (
                            <>
                                <div className={styles.dropdownitem}>
                                    <div className={styles.dropdownlogocontainer}>
                                        <div className={styles.editlogodropdown}></div>
                                    </div>
                                    <p onClick={() => console.log("Edit clicked")}>Edit</p>
                                </div>
                                
                                <div className={styles.dropdownitem}>
                                    <div className={styles.dropdownlogocontainer}>
                                        <div className={styles.deletelogodropdown}></div>
                                    </div>
                                    <p onClick={() => console.log("Delete clicked")}>Delete</p>
                                </div>
                            </>
                        ) : (
                            <div className={styles.dropdownitem}>
                                <div className={styles.dropdownlogocontainer}>
                                    <div className={styles.reportlogodropdown}></div>
                                </div>
                                <p onClick={() => console.log("Report clicked")}>Report</p>
                            </div>
                        )}
                    </div>
                    )}
                </div>

          </div>

          <div className={styles.messagecontainer}>
            <p>{postData.message}</p>
          </div>

            <hr/>
            <div className={styles.footercontainer}>
                <div className={currentUserLiked ? styles.footerbuttoncontainerliked : styles.footerbuttoncontainer} onClick={() => likePost(postData.id)}>
                    <div className={currentUserLiked ? styles.likelogoliked : styles.likelogo}></div>
                    <p>{postData.likesAmount}</p>
                </div>
                <div className={styles.footerbuttoncontainer}>
                    <div className={styles.commentlogo}></div>
                    <p>{postData.commentsAmount}</p>
                </div>
                <div className={styles.footerbuttoncontainer}>
                    <div className={styles.sharelogo}></div>
                    <p>67</p>
                </div>
            </div>
            <hr/>
            <div className={styles.usercommentsectioncontainer}>
                <div className={styles.commentinputcontainer}>
                    <img src={userProfile.photoURL} className={styles.commentinputpfp}/>
                    <div className={styles.textareacontainer}>
                        <textarea placeholder="Write a comment.." onChange={userCommentChange} ref={textareaRef} value={userCommentInput}></textarea>
                        <div className={styles.textareabuttoncontainer}>
                            <div className={userCommentInput !== "" ? styles.sendbutton : styles.sendbuttonoff} onClick={postComment}>
                                <img src='/paperplane.svg' className={styles.sendbuttonimage}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr/>
            <div className={styles.commentscontainer}>
                {comments.map((comment) => <Comment
                                                key={comment.id}
                                                postId={postData.id}
                                                commentId={comment.id}
                                                userId={comment.userId}
                                                edited={comment.edited}
                                                photoURL={comment.user.photoURL}
                                                username={comment.user.username}
                                                message={comment.text}
                                                createdAt={timeAgo(comment.createdAt)}
                                                replies={comment.replies}
                                                likesAmount={comment.likesAmount}
                                                ownerId={postData.userId}
                                                openDropdownId={openDropdownId}
                                                setOpenDropdownId={setOpenDropdownId}
                                                redirectToUserPage={() => navigate(`/account/${comment.userId}`)}
                                                currentUserPhotoURL={userProfile.photoURL}
                                                />)}
            </div>
        </div>

        {/* Sidebar friends */}
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

export default Posts;
