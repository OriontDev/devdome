import styles from './CommentEditConfirm.module.css';

function CommentEditConfirm( {editComment, setShowEditConfirm} ){
    return(
        <div className={styles.container}>
            <h1>Delete comment</h1>
            <p>Delete your comment permanently?</p>
            <div className={styles.buttonsContainer}>
                <button onClick={setShowEditConfirm} className={styles.cancelButton}>Cancel</button>
                <button onClick={editComment} className={styles.deleteButton}>Delete</button>
            </div>
        </div>        
    );
}

export default CommentEditConfirm