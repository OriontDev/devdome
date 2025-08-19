import Header from "../components/Header/Header.jsx";
import styles from './Account.module.css'
import github_logo from "../assets/github.svg"
import x_logo from "../assets/x.svg"
import linkedin_logo from "../assets/linkedin.svg"
import pfp from '/public/pfp.png';
import Projectcard from "../components/Projectcard/Projectcard.jsx";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import { auth, db } from "../config/firebase";

function Account(){

    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const userPhoto = profile?.photoURL || pfp; // fallback if no photo
    console.log(userPhoto);
    const tempCommentAmount = 90;
    const tempLikeAmount = 100;

    const { uid } = useParams();



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
    }, [uid]);


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

                    
                    {currentUser?.uid === profile?.uid ? <button className={styles.editbutton}>Edit Profile</button> : <></>}
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