import { useEffect, useRef, useState } from 'react';
import styles from './Comment.module.css';
import Reply from '../Reply/Reply.jsx'
import { doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebase"; // ✅ adjust path
import { useNavigate } from 'react-router-dom';

import pfp from '/public/pfp.png'; //loading pfp

function Comment( { postId, commentId, userId, edited, photoURL, username, message, createdAt, replies = [], likesAmount, ownerId, openDropdownId, setOpenDropdownId, openReplyId, setOpenReplyId, redirectToUserPage, userProfile, onAddReply, setPostData, deleteComment} ){
    const [isLong, setIsLong] = useState(false)
    const [messageCutted, setMessageCutted] = useState(false)
    const [hasReplies, setHasReplies] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [currentUserLiked, setCurrentUserLiked] = useState(false);
    const [likes, setLikes] = useState(likesAmount);
    const [userReplyInput, setUserReplyInput] = useState("")



    async function postReply(){
        if (userReplyInput.length === 0) return;
        const authUser = auth.currentUser;
        if (!authUser || userReplyInput.trim() === "") return;

        const commentsCollectionRef = collection(db, "posts", postId, "comments");

        // New reply data
        const newReply = {
            userId: authUser.uid,
            text: userReplyInput,
            createdAt: serverTimestamp(),
            edited: false,
            parentCommentId: commentId, // top-level comment
            likesAmount: 0
        };

        // Add comment to Firestore
        const replyDoc = await addDoc(commentsCollectionRef, newReply);

        // Increment post's commentsAmount
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { commentsAmount: increment(1) });

        // Reset input
        setUserReplyInput("");
        setOpenReplyId(null);

        // ✅ Optimistic update via parent callback
        if (typeof onAddReply === "function") {
            onAddReply(commentId, {
                id: replyDoc.id,
                ...newReply,
                createdAt: new Date(), // for "just now"
                user: {
                    username: userProfile.username || authUser.displayName || "Unknown",
                    photoURL: userProfile.photoURL || authUser.photoURL || pfp,
                },
            });
            console.log("optimistic completed")
        }

        setPostData(prev => prev ? { ...prev, commentsAmount: prev.commentsAmount + 1 } : prev);
    }

//handle userreplyinput
    const textareaRef = useRef(null);

    const userReplyChange = (e) => {
        setUserReplyInput(e.target.value);

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

    const navigate = useNavigate();
    const isUserReplyOpen = openReplyId === commentId;

    function toggleUserReplyOpen() {
    if (isUserReplyOpen) {
        setOpenReplyId(null); // close if already open
    } else {
        setOpenReplyId(commentId); // open this one
    }
    }

    //handle dropdown of comments
    const isDropdownOpen = openDropdownId === commentId;

    function toggleDropdown() {
        if (isDropdownOpen) {
            setOpenDropdownId(null); // close
        } else {
            setOpenDropdownId(commentId); // open this one
        }
    }

    function getPreview(message) {
        const lines = message.split("\n");

        // If too many lines, cut after 8
        if (lines.length > 8) {
            return lines.slice(0, 8).join("\n") + "...";
        }

        // If too many characters, cut at 256
        if (message.length > 256) {
            return message.slice(0, 256) + "...";
        }

        // Otherwise return full
        return message;
    }



    useEffect(() => {
        //setIsLong if the message length (letter + space) is 256 or if there are more than 8 lines
        const lines = message.split("\n").length;
        if (message.length >= 256 || lines > 8) { 
            setIsLong(true);
        }
    }, [message]);

        

    useEffect(() => {

        if (replies.length !== 0) {
            setHasReplies(true);
        }

        // ✅ check if current user already liked this comment
        const checkLike = async () => {
            const authUser = auth.currentUser;
            if (!authUser || !postId || !commentId) return; // guard

            const likeRef = doc(db, "posts", postId, "comments", commentId, "likes", authUser.uid);
            const likeSnap = await getDoc(likeRef);
            if (likeSnap.exists()) {
                setCurrentUserLiked(true);
            }
        };

        checkLike();
    }, [postId, commentId, message, replies]);

    async function likeComment() {
        const authUser = auth.currentUser;
        if (!authUser) return;

        const commentRef = doc(db, "posts", postId, "comments", commentId);
        const likeRef = doc(db, "posts", postId, "comments", commentId, "likes", authUser.uid);

        try {
            if (currentUserLiked) {
                // ✅ Unlike
                await deleteDoc(likeRef);
                await updateDoc(commentRef, {
                    likesAmount: increment(-1),
                });
                setLikes(prev => prev - 1);
                setCurrentUserLiked(false);
            } else {
                // ✅ Like
                await setDoc(likeRef, {
                    userId: authUser.uid,
                    createdAt: new Date(),
                });
                await updateDoc(commentRef, {
                    likesAmount: increment(1),
                });
                setLikes(prev => prev + 1);
                setCurrentUserLiked(true);
            }
        } catch (err) {
            console.error("Error liking comment:", err);
        }
    }

    return(
        <div className={styles.container}>
            <img src={photoURL} className={styles.pfp}/>
            <div className={styles.rightcontainer}>
                <div className={styles.usercontainer}>
                    <div className={styles.namedatecontainer}>
                        {/* if the comment is fro the owner of the post, highlight the username */}
                        <p className={styles.namedate}><span className={userId === ownerId ? styles.postownernamedate : styles.username} onClick={redirectToUserPage}>@{username}</span> - {createdAt} {edited === true && <span className={styles.editednamedate}>(Edited)</span>} </p>

                        <div className={styles.dropdownbutton} onClick={toggleDropdown}>
                            <div className={styles.dropdownbuttonlogo}></div>
                        </div>

                        {isDropdownOpen && (
                        <div className={styles.dropdownmenu}>
                            {auth.currentUser?.uid === userId ? (
                            <>
                                <p className={styles.dropdownitem}>Edit</p>
                                <p className={`${styles.dropdownitem} ${styles.delete}`} onClick={deleteComment}>Delete</p>
                            </>
                            ) : (
                            <p className={styles.dropdownitem}>Report</p>
                            )}
                        </div>
                        )}
                    </div>

                    <div className={styles.messagecontainer}>
                    <p className={styles.message}>
                        {!isLong 
                            ? message 
                            : (!messageCutted 
                                ? getPreview(message) 
                                : message)}
                    </p>

                        {isLong ? 
                            <p className={styles.showtext} onClick={() => setMessageCutted(prev => !prev)}>{messageCutted ? "Show Less." : "Show More.."}</p> : 
                            <></>
                        }
                        
                    </div>
                </div>
                <div className={styles.buttonscontainer}>
                    <div className={currentUserLiked ? styles.likedlogocontainer : styles.logocontainer} onClick={likeComment}>
                        <div className={currentUserLiked ? styles.likelogoliked : styles.likelogo}></div>
                        <p>{likes}</p>
                    </div>
                    <div className={styles.logocontainer} onClick={toggleUserReplyOpen}>
                        <div className={styles.commentlogo}></div>
                        <p>{replies.length}</p>
                    </div>
                </div>

                <div className={styles.repliescontainer}>
                    {isUserReplyOpen &&
                        <div className={styles.userReplyContainer}>
                            <img src={userProfile.photoURL} className={styles.userReplyPfp}/>
                            <div className={styles.userReplyTextButtonContainer}>
                                <textarea ref={textareaRef} value={userReplyInput} onChange={userReplyChange} className={styles.userReplyInput}></textarea>
                                <div className={styles.userReplyButtonsContainer}>
                                    <button className={styles.cancelUserReplyButton} onClick={toggleUserReplyOpen}>Cancel</button>
                                    <button className={userReplyInput.length !== 0 ? styles.postUserReplyButton : styles.disabledPostUserReplyButton} onClick={postReply}>Post</button>
                                </div>
                            </div>
                        </div>                    
                    }

                    {!hasReplies ? <></> : (!replyOpen ? <p className={styles.showreplybutton} onClick={() => setReplyOpen(true)}>⮟Show Replies</p> : <p className={styles.showreplybutton} onClick={() => setReplyOpen(false)}>⮝Hide Replies</p>)}
                    {replyOpen ? replies.map((reply) => <Reply
                                                key={reply.id}
                                                postId={postId}
                                                replyId={reply.id}
                                                userId={reply.userId}
                                                photoURL={reply.user.photoURL} 
                                                username={reply.user.username} 
                                                message={reply.text}
                                                createdAt={reply.createdAt}
                                                likesAmount={reply.likesAmount}
                                                ownerId={ownerId}
                                                openDropdownId={openDropdownId}
                                                setOpenDropdownId={setOpenDropdownId}
                                                redirectToUserPage={() => navigate(`/account/${reply.userId}`)}
                                            />) : <></>}
                </div>

            </div>
        </div>
    )

}

export default Comment;