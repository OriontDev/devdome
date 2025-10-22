import styles from "./Project.module.css"
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import EditProfile from "../components/EditProfile/EditProfile.jsx";
import github_logo from "../assets/github.svg"
import personal_logo from "../assets/website.svg"
import x_logo from "../assets/x.svg"
import linkedin_logo from "../assets/linkedin.svg"
import pfp from '/public/pfp.png'; //loading pfp
import AddProject from "../components/AddProject/AddProject.jsx";
import Projectcard from "../components/Projectcard/Projectcard.jsx";
import { doc, getDoc, getDocs, setDoc, onSnapshot, collection, deleteDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";


function Project(){
    const { id } = useParams(); // get projectId from URL
    const imagesTemp = ['./pfp1.svg', './pfp2.svg', './pfp3.svg', './pfp4.svg', ]

    const [projectData, setProjectData] = useState([]);

    const navigate = useNavigate(); //initialize usenavigate

    // the current user logged in
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        // Subscribe to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user || null);
        });

        return () => unsubscribe();
    }, []);

    // ✅ Fetch project data + user info
    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
        setIsLoading(true);
        try {
            const projectRef = doc(db, "projects", id);
            const projectSnap = await getDoc(projectRef);

            if (!projectSnap.exists()) {
                console.warn("⚠️ No such project found");
                navigate("/error", { state: { invalidProject: true } });
                return;
            }

            const projectData = projectSnap.data();

            // Fetch owner/user data
            let userData = null;
            if (projectData.userId) {
                const userRef = doc(db, "users", projectData.userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    userData = userSnap.data();
                }
            }

            // Combine data nicely
            const combinedData = {
            id: projectSnap.id,
            ...projectData,
            owner: userData
                ? {
                    username: userData.username,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                }
                : null,
            createdAt: projectData.createdAt
                ? projectData.createdAt.toDate().toLocaleString()
                : null,
            };

            setProjectData(combinedData);

            // Check if current user owns the project
            if (currentUser && projectData.userId === currentUser.uid) {
                setIsOwner(true);
            } else {
                setIsOwner(false);
            }
        } catch (err) {
            console.error("❌ Error fetching project:", err);
        } finally {
            setIsLoading(false);
        }
        };

        fetchProject();
    }, [id, currentUser, navigate]);

    if (isLoading) {
        return <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</h2>;
    }

    if (!projectData) {
        return <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Project not found.</h2>;
    }



    // fetch project data from Firebase using id
    console.log(id);
    return(
        <>
            <div className={styles.mainContainer}>
                <div className={styles.sidebarContainer}>
                    <div className={styles.sidebarHeaderContainer}>
                        <h1>Attachments</h1>
                    </div>
                    <div className={styles.sidebarContentContainer}>
                        <div className={styles.sidebarImagesContainer}>
                            {imagesTemp.map((image, index) => (
                                <img src={image} className={styles.sidebarImage} key={index}/>
                            ))}
                        </div>
                    </div>
                    
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.contentHeaderContainer}>
                        <h1>{projectData.title}</h1>
                    </div>

                    {projectData.bannerURL && projectData.bannerURL.trim() !== "" ? (
                        <img
                            className={styles.projectBanner}
                            src={projectData.bannerURL}
                            alt="Project Banner"
                            onError={(e) => (e.target.style.display = "none")} // hides if invalid URL
                        />
                    ) : null}
                    
                    <div className={styles.contentBodyContainer}>
                        <p className={styles.description}>{projectData.description}</p>
                    </div>
                    {/* src="https://placehold.co/3000x720" */}
                </div>
            </div>
        </>
    );
}

export default Project