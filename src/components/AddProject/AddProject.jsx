import { useEffect, useState, useRef } from 'react';
import styles from './AddProject.module.css';

function AddProject( {createProject, setIsCreatingProject} ){
    
    const [tagsInput, setTagsInput] = useState(""); // text typed by user
    const textareaRef = useRef(null); // <--- CREATE A REF

    const [projectData, setProjectData] = useState({
        title: "",
        description: "",
        link: "",
        thumbnailURL: "",
        bannerURL: "",
        tags: [],
    });

    const handleCreateClicked = () => {
        // Check for required fields
        if (!projectData.title.trim() || !projectData.description.trim()) {
            alert("Please fill in both the Title and Description before posting.");
            return; // stop the function if missing
        }

        // Everything is fine → continue
        createProject(projectData);
    };


    const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tags") {
        setTagsInput(value); // let user type freely
        const tagArray = value.split(" ").filter(tag => tag.trim() !== "");
        setProjectData({ ...projectData, tags: tagArray });
    } else {
        setProjectData({ ...projectData, [name]: value });
    }
    };


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
    }, [projectData.description]);

    return(
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1>Create Project</h1>
            </div>

            <div className={styles.contentContainer}>
                {/* <div className={styles.projectContainer}>
                    <h3>Project:</h3>
                    <h3 className={styles.linkButton}>Link this post to a project?</h3>
                </div> */}

                <div className={styles.editcontainer}>
                    <p className={styles.edittitle}>Project Title</p>
                    <input
                        name="title"
                        value={projectData.title}
                        onChange={handleChange}
                        placeholder="Insert Project Title"
                    />
                </div>

                <div className={styles.textareaContainer}>
                    <textarea name="description" value={projectData.description} onChange={handleChange} ref={textareaRef} placeholder='Insert Project description here..'></textarea>
                </div>


                <div className={styles.editcontainerlong}>
                    <p className={styles.edittitle}>Project's Link</p>
                    <input
                        name="link"
                        value={projectData.link}
                        onChange={handleChange}
                        placeholder="Insert display name"
                    />
                </div>

                <div className={styles.editcontainerlong}>
                    <p className={styles.edittitle}>Thumbnail URL</p>
                    <input
                        name="thumbnailURL"
                        value={projectData.thumbnailURL}
                        onChange={handleChange}
                        placeholder="Insert Thumbnail URL"
                    />
                    <img className={styles.thumbnailPreview} src={projectData.thumbnailURL} alt='Thumbnail Preview'/>
                </div>

                <div className={styles.editcontainerlong}>
                    <p className={styles.edittitle}>Banner URL (Optional)</p>
                    <input
                        name="bannerURL"
                        value={projectData.bannerURL}
                        onChange={handleChange}
                        placeholder="Insert Banner's URL"
                    />
                    <img className={styles.bannerPreview} src={projectData.bannerURL} alt='Banner Preview'/>
                </div>

                <div className={styles.editcontainerlong}>
                    <p className={styles.edittitle}>Project's tags (Space seperated)</p>
                    <input
                    name="tags"
                    value={tagsInput} // use text version instead of joined array
                    onChange={handleChange}
                    placeholder="e.g. Entertainment Fun Calculator Kids"
                    />

                </div>

                <div className={styles.buttonsContainer}>
                    <button onClick={setIsCreatingProject} className={styles.cancelButton}>Cancel</button>
                    <button onClick={handleCreateClicked} className={styles.deleteButton}>Post</button>
                </div>
            </div>



        </div>        
    );
}

export default AddProject