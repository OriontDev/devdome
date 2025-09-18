import { useEffect, useState } from 'react';
import styles from './PostEditConfirm.module.css';

function PostEditConfirm( {editPost, setShowPostEditConfirm, setEditPostInput, currentPostText} ){
    
    const [localText, setLocalText] = useState(currentPostText);

    // If currentCommentText changes (e.g. when editing another comment), update local state
    useEffect(() => {
        setLocalText(currentPostText);
    }, [currentPostText]);

    const handleChange = (e) => {
        setLocalText(e.target.value);
        setEditPostInput(e.target.value); // keep parent state in sync
    };

    function handleEditClicked(){
        console.log("edit clicked post!");
        editPost();
    }
    
    return(
        <div className={styles.container}>
            <h1>Edit Post</h1>
            <div className={styles.textareaContainer}>
                <textarea onChange={handleChange} value={localText}></textarea>
            </div>

            <div className={styles.buttonsContainer}>
                <button onClick={setShowPostEditConfirm} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleEditClicked} className={styles.deleteButton}>Edit</button>
            </div>
        </div>        
    );
}

export default PostEditConfirm