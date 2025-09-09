import styles from './CommentDeleteConfirm.module.css';

function CommentDeleteConfirm( {deleteComment, setShowDeleteConfirm} ){
    return(
        <div className={styles.container}>
            <h1>Delete comment</h1>
            <p>Delete your comment permanently?</p>
            <div className={styles.buttonsContainer}>
                <button onClick={setShowDeleteConfirm} className={styles.cancelButton}>Cancel</button>
                <button onClick={deleteComment} className={styles.deleteButton}>Delete</button>
            </div>
        </div>        
    );
}

export default CommentDeleteConfirm