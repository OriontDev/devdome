import styles from './CommentEditConfirm.module.css';

function CommentEditConfirm( {editComment, setShowEditConfirm} ){
    return(
        <div className={styles.container}>
            <h1>Edit comment</h1>
            <div className={styles.textareaContainer}>
                <textarea></textarea>
            </div>

            <div className={styles.buttonsContainer}>
                <button onClick={setShowEditConfirm} className={styles.cancelButton}>Cancel</button>
                <button onClick={editComment} className={styles.deleteButton}>Edit</button>
            </div>
        </div>        
    );
}

export default CommentEditConfirm