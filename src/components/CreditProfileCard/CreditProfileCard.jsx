import styles from './CreditProfileCard.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';

function CreditProfileCard( { username, photo, userid, requestSent, sendFriendRequestFunc, cancelFriendRequestFunc } ){

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
                    <p>Owner</p>
                </div>
            </div>
        </>
    );
}

export default CreditProfileCard