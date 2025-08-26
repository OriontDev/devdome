import styles from './Post.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';

function Post(){

    const navigate = useNavigate();

    return(
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <img src={pfp} className={styles.pfp}/>
                    <div className={styles.title}>
                        <p className={styles.username}>@aaa</p>
                        <p className={styles.date}>August 1th 1943</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Post