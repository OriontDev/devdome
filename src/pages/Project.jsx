import styles from "./Project.module.css"
import { useParams } from "react-router-dom";
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
                            {imagesTemp.map((image) => (
                                <img src={image} className={styles.sidebarImage}/>
                            ))}
                        </div>
                    </div>
                    
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.contentHeaderContainer}>
                        <h1>PROJECT TITLE GOES HERE!</h1>
                    </div>
                    <img className={styles.projectBanner} src="https://images.ctfassets.net/pt9zoi1ijm0e/2pHB4TdB5ppLWIR9Uy1Izf/a1290200b9751c98f9870fd0c909ae4c/1__2_.png"/>
                    <div className={styles.contentBodyContainer}>
                        <h1>a</h1>
                    </div>
                    {/* src="https://placehold.co/3000x720" */}
                </div>
            </div>
        </>
    );
}

export default Project