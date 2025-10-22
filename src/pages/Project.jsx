import styles from "./Project.module.css"
import { useParams } from "react-router-dom";

function Project(){
    const { id } = useParams(); // get projectId from URL
    // fetch project data from Firebase using id
    console.log(id);
    return(
        <>
            <div className={styles.mainContainer}>
                <div className={styles.sidebarContainer}>
                    <div className={styles.sidebarHeaderContainer}>
                        <h1>Attachments</h1>
                    </div>
                    
                </div>
                <div className={styles.contentContainer}>
                    <h1>Main</h1>
                </div>
            </div>
        </>
    );
}

export default Project