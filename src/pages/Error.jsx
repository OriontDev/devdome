import logo from '/public/logo.png';
import styles from './Error.module.css'
import { useNavigate } from 'react-router-dom';

function Error(){

    const navigate = useNavigate(); //initialize usenavigate

    return(
        <>
            <div className={styles.container}>
                <h1>This page is not available</h1>
                <h5>The link you followed may be broken, or the page may have been deleted</h5>
                <img src={logo} className={styles.logo}/>
                <button className={styles.returnbutton} onClick={() => navigate(-1)}>Return to previous page</button>
            </div>

        </>
    )
}

export default Error