import styles from './ProfileCard.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';

function ProfileCard( { username, photo, userid } ){

    const navigate = useNavigate();

    return(
        <>
            <div className={styles.container}>
                <img 
                    src={photo || pfp} 
                    className={styles.profilepicture} 
                    alt="profile"
                    onClick={() => navigate(`/account/${userid}`)}
                />
                <div className={styles.infocontainer}>
                    <h1 className={styles.username} onClick={() => navigate(`/account/${userid}`)}>@{username}</h1>
                    <button className={styles.addbutton}>Send friend request</button>
                </div>
            </div>
        </>
    );
}

export default ProfileCard