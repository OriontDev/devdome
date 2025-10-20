import Header from "../components/Header/Header.jsx";
import EditProfile from "../components/EditProfile/EditProfile.jsx";
import styles from './Account.module.css'
import github_logo from "../assets/github.svg"
import personal_logo from "../assets/website.svg"
import x_logo from "../assets/x.svg"
import linkedin_logo from "../assets/linkedin.svg"
import pfp from '/public/pfp.png'; //loading pfp
import Projectcard from "../components/Projectcard/Projectcard.jsx";
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
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

    const [friends, setFriends] = useState([]);

    const [isFriend, setIsFriend] = useState(false);

    // Check if currentUser and profile are friends
    useEffect(() => {
        if(isOwner){return};
        if (!profile || friends.length === 0) {
            setIsFriend(false);
            return;
        }

        const friendExists = friends.some(friend => friend.id === profile.uid);
        setIsFriend(friendExists);
    }, [friends, profile]);



    const userPhoto = profile?.photoURL || pfp; // fallback if no photo
    // console.log(userPhoto);
    const tempCommentAmount = 90;
    const tempLikeAmount = 100;

    const closePopup = () => {
        setIsEditing(false);
    };

    const { uid } = useParams();

    //Check if the page is ours or not
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



    //fetch the info of the profile we are viewing, it could be ours or other people's
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

    // fetch user's friends
    // real-time listener for user's friends with onsnapshot
    useEffect(() => {
        if (!currentUser) return;

        const friendsRef = collection(db, "users", currentUser.uid, "friends");
        const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
            const friendsData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const friendRef = doc(db, "users", data.uid);
                    const friendSnap = await getDoc(friendRef);
                    return friendSnap.exists()
                        ? { id: friendSnap.id, ...friendSnap.data() }
                        : null;
                })
            );
            setFriends(friendsData.filter(Boolean));
        });

        return () => unsubscribe();
    }, [currentUser]);


    console.log("Profile photo:", profile?.photoURL);
    console.log("Current user photo:", currentUser?.photoURL);

    return(
        <>
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
                                    {/* Username */}
                                    <h2 className={styles.usernametop}>@{profile?.username?.slice(0, 20) || "User"}</h2>
                                    <h2 className={styles.usernametop}>{profile?.displayName?.slice(0, 20) || "User"}</h2>
                                    {/* Created */}
                                    <h2 className={styles.usernametop}>
                                    {profile?.createdAt
                                        ? `Created at: ${new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}`
                                        : "..."}
                                    </h2>
                                </div>                      
                            </>
                        )}

                    </div>

                    {profile?.bio ? <p className={styles.bio}>{profile.bio}</p> : <p>Loading bio..</p>}

                    {!isOwner && !isFriend && (
                        <button className={styles.friendRequestButton}>Send friend request</button>
                    )}

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