import { useEffect, useState } from 'react';
import styles from './Reply.module.css';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../config/firebase"; // ✅ import auth + db
import pfp from '/public/pfp.png'; //loading pfp

function Reply( { postId, userId, replyId, photoURL, username, message, createdAt, likesAmount, ownerId, openDropdownId, setOpenDropdownId, redirectToUserPage} ){
    const [isLong, setIsLong] = useState(false)
    const [messageCutted, setMessageCutted] = useState(false)

    const [currentUserLiked, setCurrentUserLiked] = useState(false);
    const [likes, setLikes] = useState(likesAmount || 0);


    //check if any dropdown is open
    const isDropdownOpen = openDropdownId === replyId;
    function toggleDropdown() {
        if (isDropdownOpen) {
            setOpenDropdownId(null); // close it
        } else {
            setOpenDropdownId(replyId); // open this reply’s dropdown (and close others automatically)
        }
    }


    useEffect(() => {
        if (message?.length >= 256) {
            setIsLong(true);
        }

        // ✅ check if current user already liked this reply
        const checkLike = async () => {
            const authUser = auth.currentUser;
            if (!authUser || !postId || !replyId) return;

            try {
                const likeRef = doc(db, "posts", postId, "comments", replyId, "likes", authUser.uid);
                const likeSnap = await getDoc(likeRef);
                if (likeSnap.exists()) {
                    setCurrentUserLiked(true);
                }
            } catch (err) {
                console.error("Error checking reply like:", err);
            }
        };

        checkLike();
    }, [postId, replyId, message]);

    async function likeReply() {
        const authUser = auth.currentUser;
        if (!authUser || !postId || !replyId) return;

        // ✅ reply itself is still just a comment doc
        const replyRef = doc(db, "posts", postId, "comments", replyId);
        const likeRef = doc(db, "posts", postId, "comments", replyId, "likes", authUser.uid);

        try {
            if (currentUserLiked) {
                // Unlike
                await deleteDoc(likeRef);
                await updateDoc(replyRef, {
                    likesAmount: increment(-1),
                });
                setLikes(prev => prev - 1);
                setCurrentUserLiked(false);
            } else {
                // Like
                await setDoc(likeRef, {
                    userId: authUser.uid,
                    createdAt: new Date(),
                });
                await updateDoc(replyRef, {
                    likesAmount: increment(1),
                });
                setLikes(prev => prev + 1);
                setCurrentUserLiked(true);
            }
        } catch (err) {
            console.error("Error liking reply:", err);
        }
    }

    //format it so it doesnt crash on optimistic upd since we passed a raw Date
    function formatDate(createdAt) {
        if (!createdAt) return "just now";

        // Firestore Timestamp has .toDate()
        if (createdAt.toDate) return createdAt.toDate().toLocaleString();

        // JS Date
        if (createdAt instanceof Date) return createdAt.toLocaleString();

        return String(createdAt); // fallback
    }


    return(
        <div className={styles.container}>
            <img src={photoURL} className={styles.pfp}/>
            <div className={styles.rightcontainer}>
                <div className={styles.usercontainer}>
                    <div className={styles.namedatecontainer}>
                        <p className={styles.namedate}><span className={userId === ownerId ? styles.postownernamedate : styles.username} onClick={redirectToUserPage}>@{username}</span> - {formatDate(createdAt)}</p>
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
                    <div className={currentUserLiked ? styles.likedlogocontainer : styles.logocontainer} onClick={likeReply}>
                        <div className={currentUserLiked ? styles.likelogoliked : styles.likelogo}></div>
                        <p>{likes}</p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Reply;