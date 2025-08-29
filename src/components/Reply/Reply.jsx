import { useEffect, useState } from 'react';
import styles from './Reply.module.css';
import pfp from '/public/pfp.png'; //loading pfp

function Reply( { userId, photoURL, username, message, createdAt, ownerId} ){
    const [isLong, setIsLong] = useState(false)
    const [messageCutted, setMessageCutted] = useState(false)

    useEffect(() => {
        if(message.length >= 256){
            setIsLong(true);
        }
    }, [])

    return(
        <div className={styles.container}>
            <img src={photoURL} className={styles.pfp}/>
            <div className={styles.rightcontainer}>
                <div className={styles.usercontainer}>
                    <p className={styles.namedate}><span className={userId === ownerId ? styles.postownernamedate : ""}>@{username}</span> - {createdAt}</p>
                    <div className={styles.messagecontainer}>
                    <p>
                    {!isLong 
                        ? message 
                        : (!messageCutted 
                            ? message.slice(0, 256) + "..." 
                            : message)}
                    </p>

                        {isLong ? 
                            <p className={styles.showtext} onClick={() => setMessageCutted(prev => !prev)}>{messageCutted ? "Show Less." : "Show More.."}</p> : 
                            <></>
                        }
                        
                    </div>
                </div>
                <div className={styles.buttonscontainer}>
                    <div className={styles.logocontainer}>
                        <div className={styles.likelogo}></div>
                        <p>78</p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Reply;