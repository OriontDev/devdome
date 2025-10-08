import { useEffect, useState } from 'react';
import styles from './AddPost.module.css';

function AddPost( {createPost, setShowAddPost, setAddPostInput} ){
    
    const [localText, setLocalText] = useState("");

    // // If currentCommentText changes (e.g. when editing another comment), update local state
    // useEffect(() => {
    //     setLocalText(currentPostText);
    // }, [currentPostText]);

    const handleChange = (e) => {
        setLocalText(e.target.value);
        setAddPostInput(e.target.value); // keep parent state in sync
    };

    function handleCreateClicked(){
        createPost();
    }
    
    return(
        <div className={styles.container}>
            <h1>Create Post</h1>

            <div className={styles.projectContainer}>
                <h3>Project:</h3>
                <h3 className={styles.linkButton}>Link this post to a project?</h3>
            </div>

            <div className={styles.textareaContainer}>
                <textarea onChange={handleChange} value={localText}></textarea>
            </div>

            <div className={styles.buttonsContainer}>
                <button onClick={setShowAddPost} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleCreateClicked} className={styles.deleteButton}>Post</button>
            </div>
        </div>        
    );
}

export default AddPost