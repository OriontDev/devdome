import styles from './Post.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';
import exitlogo from '/exitlogo.svg'

function Post( {username, displayName, userPhotoURL, message, createdAt, likesAmount, commentsAmount, currentUserLiked, likeFunction, redirectToPostPage, redirectToUserPage, projectId } ){

    const navigate = useNavigate();

    return(
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <img src={userPhotoURL || pfp} className={styles.pfp} onClick={redirectToUserPage}/>
                    <div className={styles.title}>
                        <p className={styles.username} onClick={redirectToUserPage}>@{username} - {displayName}</p>
                        <p className={styles.date}>{createdAt}</p>
                    </div>
                    <div className={styles.postinfobutton}>•••</div>
                </div>

                <div className={styles.projectidcontainer} onClick={() => {navigate(`/project/${projectId}`)}}>
                    <p>Project: To-Do List</p>
                </div>  

                <div className={styles.messagecontainer} onClick={redirectToPostPage}>
                    <p>{message}</p>
                </div>

                <hr></hr>
                <div className={styles.footercontainer}>
                    <div className={currentUserLiked ? styles.footerbuttoncontainerliked : styles.footerbuttoncontainer} onClick={likeFunction}>
                        <div className={currentUserLiked ? styles.likelogoliked : styles.likelogo}></div>
                        <p>{likesAmount}</p>
                    </div>
                    <div className={styles.footerbuttoncontainer} onClick={redirectToPostPage}>
                        <div className={styles.commentlogo}></div>
                        <p>{commentsAmount}</p>
                    </div>
                    <div className={styles.footerbuttoncontainer}>
                        <div className={styles.sharelogo}></div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Post