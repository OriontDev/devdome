import styles from './InboxRequestCard.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from "react-router-dom";

function InboxRequestCard( { senderName, senderPhoto, senderUid, acceptFunction, rejectFunction} ){

    const navigate = useNavigate();

    return(
        <>
            <div className={styles.container}>
                <img 
                    src={senderPhoto || pfp} 
                    className={styles.profilepicture} 
                    alt="profile"
                    onClick={() => navigate(`/account/${senderUid}`)}
                />
                <div className={styles.infocontainer}>
                    <h5 className={styles.message}>@{senderName} sent you a friend request </h5>
                    <div className={styles.buttoncontainer}>
                        <button className={styles.addbutton} onClick={acceptFunction}>Accept</button>
                        <button className={styles.addbutton} onClick={rejectFunction}>Decline</button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default InboxRequestCard