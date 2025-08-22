import styles from './ProfileCard.module.css';
import pfp from '/public/pfp.png'; //loading pfp

function ProfileCard(){
    return(
        <>
            <div className={styles.container}>
                <img src={pfp} className={styles.profilepicture}/>
                <div className={styles.infocontainer}>
                    <h1 className={styles.username}>@Username</h1>
                    <button>ss</button>
                </div>
            </div>
        </>
    );
}

export default ProfileCard