import { useEffect, useState } from 'react';
import styles from './CommentEditConfirm.module.css';

function CommentEditConfirm( {editComment, setShowEditConfirm, setEditCommentInput, currentCommentText} ){
    
    const [localText, setLocalText] = useState(currentCommentText);

    // If currentCommentText changes (e.g. when editing another comment), update local state
    useEffect(() => {
        setLocalText(currentCommentText);
    }, [currentCommentText]);

    const handleChange = (e) => {
        setLocalText(e.target.value);
        setEditCommentInput(e.target.value); // keep parent state in sync
    };
    
    return(
        <div className={styles.container}>
            <h1>Edit comment</h1>
            <div className={styles.textareaContainer}>
                <textarea onChange={handleChange} value={localText}></textarea>
            </div>

            <div className={styles.buttonsContainer}>
                <button onClick={setShowEditConfirm} className={styles.cancelButton}>Cancel</button>
                <button onClick={editComment} className={styles.deleteButton}>Edit</button>
            </div>
        </div>        
    );
}

export default CommentEditConfirm