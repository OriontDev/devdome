import styles from './Post.module.css';
import pfp from '/public/pfp.png'; //loading pfp
import { useNavigate } from 'react-router-dom';
import exitlogo from '/exitlogo.svg'

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
                    <div className={styles.postinfobutton}>•••</div>
                    <div className={styles.deletepostbutton}>X</div>
                </div>
                <div className={styles.messagecontainer}>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Libero neque delectus tenetur sapiente veniam optio rem quas similique impedit ratione exercitationem at, nisi, ad dolores quaerat eos deleniti voluptate rerum?</p>
                </div>
                <div className={styles.footercontainer}>
                    <div className={styles.likecontainer}>
                        <div className={styles.likelogo}></div>
                        <p>aaaaa</p>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Post