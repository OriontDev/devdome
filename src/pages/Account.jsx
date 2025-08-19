import Header from "../components/Header/Header.jsx";
import EditProfile from "../components/EditProfile/EditProfile.jsx";
import styles from './Account.module.css'
import github_logo from "../assets/github.svg"
import x_logo from "../assets/x.svg"
import linkedin_logo from "../assets/linkedin.svg"
import pfp from '/public/pfp.png'; //loading pfp
import Projectcard from "../components/Projectcard/Projectcard.jsx";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import { auth, db } from "../config/firebase";

function Account(){

    // info of the profile we are viewing
    const [profile, setProfile] = useState(null);
    // the current user logged in
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);


    const userPhoto = profile?.photoURL || pfp; // fallback if no photo
    // console.log(userPhoto);
    const tempCommentAmount = 90;
    const tempLikeAmount = 100;

    const closePopup = () => {
        setIsEditing(false);
    };

    const { uid } = useParams();

    useEffect(() => {
    if (currentUser && profile) {
        setIsOwner(currentUser.uid === profile.uid);
    } else {
        setIsOwner(false);
    }
    }, [currentUser, profile]);

    useEffect(() => {
        // Subscribe to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user || null);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const targetUid = uid || auth.currentUser?.uid;
            if (!targetUid) return;

            const docRef = doc(db, "users", targetUid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // setProfile(docSnap.data());
                setProfile({ uid: docSnap.id, ...docSnap.data() }); // include uid
            } else {
                    console.log("No profile found for this uid!");
            }
        };

        fetchProfile();
    }, [uid]); //repeat everytime uid in web link mounts or changed


    console.log("Profile photo:", profile?.photoURL);
    console.log("Current user photo:", currentUser?.photoURL);

    return(
        <>
            <Header/>
            <div className={styles.maincontainer}>
                <div className={styles.sidebarcontainer}>

                    <div className={styles.sidebartopcontainer}>
                        {currentUser === null && profile === null ? (<p>Loading..</p>) : (
                            <>
                                {profile?.photoURL || currentUser?.photoURL ? (
                                    <img
                                    src={profile?.photoURL || currentUser?.photoURL}
                                    className={styles.sidebartoppfp}
                                    alt="ads"
                                    />
                                ) : (
                                    <img src={pfp} className={styles.sidebartoppfp} />
                                )}
                                <div className={styles.sidebartoptextcontainer}>
                                    <h2 className={styles.usernametop}>{profile?.displayName?.slice(0, 20) || "User"}</h2>
                                </div>                      
                            </>
                        )}

                    </div>

                    {profile?.bio ? <p>{profile.bio}</p> : <p>Loading bio..</p>}


                    {isOwner && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className={styles.editbutton}>
                        Edit Profile
                    </button>
                    )}

                    {isEditing && (
                        <>
                            <div className={styles.overlay} onClick={closePopup}></div>
                            <EditProfile 
                                profile={profile} 
                                onClose={() => setIsEditing(false)} 
                                onSave={async (updatedData) => {
                                    // Update Firestore
                                    await setDoc(doc(db, "users", profile.uid), {
                                    ...profile,
                                    ...updatedData
                                    });
                                    // Update local state
                                    setProfile({ ...profile, ...updatedData });
                                }} 
                            />                        
                        </>

                    )}


                    {/* <button className={styles.editbutton}>Edit Profile</button> */}

                    <div className={styles.socialcontainer}>
                    {profile?.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                        <img className={styles.socialbutton} src={github_logo} />
                        </a>
                    )}
                    {profile?.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                        <img className={styles.socialbutton} src={linkedin_logo} />
                        </a>
                    )}
                    {profile?.x && (
                        <a href={profile.x} target="_blank" rel="noopener noreferrer">
                        <img className={styles.socialbutton} src={x_logo} />
                        </a>
                    )}
                    {profile?.personalWebsite && (
                        <a href={profile.personalWebsite} target="_blank" rel="noopener noreferrer">
                        <img className={styles.socialbutton} src={personal_logo} />
                        </a>
                    )}
                    </div>
                </div>


                <div className={styles.profilecontainer}>
                    <div className={styles.profileheader}>
                        {currentUser?.uid === profile?.uid ? <h1>Your Projects </h1> : <h1>Projects </h1>}
                    </div>
                    <div className={styles.projectscontainer}>
                        <Projectcard
                            name={"Project 1"}
                            description={"Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dol dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteuror sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur"}
                            images={[pfp]}
                            comments={tempCommentAmount}
                            likes={tempLikeAmount}
                            projectId={212312}
                        />
                        <Projectcard
                            name={"Project 1"}
                            description={"Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur Lorem ipsum dolor sit amet consecteur"}
                            images={[pfp]}
                            comments={tempCommentAmount}
                            likes={tempLikeAmount}
                            projectId={21231}
                        />
                    </div>
                    
                </div>
            </div>
        </>
    );
}

export default Account