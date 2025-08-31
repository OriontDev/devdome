import { useEffect, useState } from 'react';
import styles from './Comment.module.css';
import Reply from '../Reply/Reply.jsx'
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../config/firebase"; // ✅ adjust path

import pfp from '/public/pfp.png'; //loading pfp

function Comment( { postId, commentId, userId, edited, photoURL, username, message, createdAt, replies = [], likesAmount, ownerId, openDropdownId, setOpenDropdownId} ){
    const [isLong, setIsLong] = useState(false)
    const [messageCutted, setMessageCutted] = useState(false)
    const [hasReplies, setHasReplies] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [currentUserLiked, setCurrentUserLiked] = useState(false);
    const [likes, setLikes] = useState(likesAmount);

    const isDropdownOpen = openDropdownId === commentId;

    function toggleDropdown() {
        if (isDropdownOpen) {
            setOpenDropdownId(null); // close
        } else {
            setOpenDropdownId(commentId); // open this one
        }
    }


    useEffect(() => {
        if (message.length >= 256) {
            setIsLong(true);
        }

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
                        <p className={styles.namedate}><span className={userId === ownerId ? styles.postownernamedate : styles.username}>@{username}</span> - {createdAt} {edited === true && <span className={styles.editednamedate}>(Edited)</span>} </p>

                        <div className={styles.dropdownbutton} onClick={toggleDropdown}>
                            <div className={styles.dropdownbuttonlogo}></div>
                        </div>

                        {isDropdownOpen && (
                        <div className={styles.dropdownmenu}>
                            {auth.currentUser?.uid === userId ? (
                            <>
                                <p className={styles.dropdownitem}>Edit</p>
                                <p className={`${styles.dropdownitem} ${styles.delete}`}>Delete</p>
                            </>
                            ) : (
                            <p className={styles.dropdownitem}>Report</p>
                            )}
                        </div>
                        )}
                    </div>

                    <div className={styles.messagecontainer}>
                    <p>
                    {!isLong 
                        ? message 
                        : (!messageCutted 
                            ? message.slice(0, 256) + "..." 
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
                    <div className={styles.logocontainer}>
                        <div className={styles.commentlogo}></div>
                        <p>0</p>
                    </div>
                </div>
                {!hasReplies ? <></> : (!replyOpen ? <p className={styles.showreplybutton} onClick={() => setReplyOpen(true)}>⮟Show Replies</p> : <p className={styles.showreplybutton} onClick={() => setReplyOpen(false)}>⮝Hide Replies</p>)}
                <div className={styles.repliescontainer}>
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
                                            />) : <></>}
                </div>

            </div>
        </div>
    )

}

export default Comment;