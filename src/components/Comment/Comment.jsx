import { useEffect, useState } from 'react';
import styles from './Comment.module.css';
import pfp from '/public/pfp.png'; //loading pfp

function Comment( {message} ){

    const [isLong, setIsLong] = useState(false)
    const [messageCutted, setMessageCutted] = useState(false)

    useEffect(() => {
        if(message.length >= 256){
            setIsLong(true);
        }
    }, [])

    return(
        <div className={styles.container}>
            <img src={pfp} className={styles.pfp}/>
            <div className={styles.rightcontainer}>
                <p className={styles.namedate}>@OriontDev - 19/22/10</p>
                <div className={styles.messagecontainer}>
                    <p>{!messageCutted ? message.slice(0, 256) + "..." : message}</p>

                    {isLong ? 
                        <p className={styles.showtext} onClick={() => setMessageCutted(prev => !prev)}>{messageCutted ? "Show Less." : "Show More.."}</p> : 
                        <></>
                    }
                    
                </div>
            </div>
        </div>
    )

}

export default Comment;