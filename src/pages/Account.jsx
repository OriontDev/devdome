import Header from "../components/Header/Header.jsx";
import styles from './Account.module.css'
import { auth, db } from "../config/firebase";
import github_logo from "../assets/github.svg"
import x_logo from "../assets/x.svg"
import linkedin_logo from "../assets/linkedin.svg"
import pfp from '/public/pfp.png';
import Projectcard from "../components/Projectcard/Projectcard.jsx";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";


function Account(){

    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const userPhoto = currentUser?.photoURL || pfp; // fallback if no photo
    console.log(userPhoto);
    const tempCommentAmount = 90;
    const tempLikeAmount = 100;



    useEffect(() => {
        // Subscribe to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user || null);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
    const fetchProfile = async () => {
        if (!auth.currentUser) return;

        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProfile(docSnap.data());
        } else {
                console.log("No profile found in Firestore!");
        }
    };

    fetchProfile();
    }, []);


    return(
        <>
            <Header/>
            <div className={styles.maincontainer}>
                <div className={styles.sidebarcontainer}>

                    <div className={styles.sidebartopcontainer}>
                        {currentUser === null && profile === null ? (<p>Loading..</p>) : (
                            <>
                                <img src={userPhoto} className={styles.sidebartoppfp}/>
                                <div className={styles.sidebartoptextcontainer}>
                                    <h2 className={styles.usernametop}>{currentUser?.displayName?.slice(0, 20) || "User"}</h2>
                                </div>                      
                            </>
                        )}

                    </div>

                    <p>{profile?.bio}</p>

                    <button className={styles.editbutton}>Edit Profile</button>

                    <div className={styles.socialcontainer}>
                        {/* If profile?.github is truthy (not null, undefined, empty string, or false), then it evaluates and returns the right-hand side */}
                        {profile?.github && (
                            <a href={profile.github} target="_blank" rel="noopener noreferrer">
                                <img className={styles.socialbutton} src={github_logo} />
                            </a>
                        )}
                        {profile?.linkedin != null ? <img className={styles.socialbutton} src={linkedin_logo}/> : <></>}
                        {profile?.x != null ? <img className={styles.socialbutton} src={x_logo}/> : <></>}
                        {profile?.personalWebsite != null ? <img className={styles.socialbutton} src={linkedin_logo}/> : <></>}
                    </div>
                </div>


                <div className={styles.profilecontainer}>
                    <div className={styles.profileheader}>
                        <h1>Your Projects </h1>
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