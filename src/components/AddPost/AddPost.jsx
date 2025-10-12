import { useEffect, useState, useRef } from 'react';
import styles from './AddPost.module.css';

function AddPost( {createPost, setShowAddPost, setAddPostInput} ){
    
    const [localText, setLocalText] = useState("");
    const textareaRef = useRef(null); // <--- CREATE A REF

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
    // Auto-resize logic with an aggressive reset to guarantee expansion
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            
            // CRITICAL FIX: Temporarily set height to '0px' to force the browser 
            // to completely discard the old rendering and accurately calculate scrollHeight.
            el.style.height = '0px'; 
            
            // 1. Reset height to 'auto' to correctly calculate scrollHeight based on content
            el.style.height = 'auto'; 
            
            // 2. Set height to scrollHeight + 2px buffer for robustness.
            el.style.height = (el.scrollHeight + 2) + 'px';
            console.log("Height plus!")
            console.log(el.style.height)
            
            // NOTE on Scrollbar: Once the calculated height exceeds the CSS max-height: 30vh,
            // the CSS rule overflow-y: auto will automatically enable the scrollbar.
        }
    }, [localText]);
    
    return(
        <div className={styles.container}>
            <h1>Create Post</h1>

            <div className={styles.projectContainer}>
                <h3>Project:</h3>
                <h3 className={styles.linkButton}>Link this post to a project?</h3>
            </div>

            <div className={styles.textareaContainer}>
                <textarea onChange={handleChange} value={localText} ref={textareaRef}></textarea>
            </div>

            <div className={styles.buttonsContainer}>
                <button onClick={setShowAddPost} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleCreateClicked} className={styles.deleteButton}>Post</button>
            </div>
        </div>        
    );
}

export default AddPost