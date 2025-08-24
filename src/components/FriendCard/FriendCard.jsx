import styles from './FriendCard.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';

function FriendCard( { username, photo, userid, removeFunction } ){

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
                    <button className={styles.addbutton} onClick={removeFunction}>Remove friend</button>
                </div>
            </div>
        </>
    );
}

export default FriendCard