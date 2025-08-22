import Header from "../components/Header/Header.jsx";
import styles from './Home.module.css'
import ProfileCard from "../components/ProfileCard/ProfileCard.jsx";

function Home(){
    return(
        <>
            <Header/>
            <div className={styles.container}>
                <div className={styles.contentcontainer}>c</div>
                <div className={styles.sidebarcontainer}>
                    <ProfileCard/>
                    <ProfileCard/>
                    <ProfileCard/>
                </div>
            </div>
        </>
    );
}

export default Home