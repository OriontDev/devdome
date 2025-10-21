import logo from '/public/logo.png';
import styles from './Error.module.css'
import { useNavigate, useLocation } from 'react-router-dom';

function Error(){

    const navigate = useNavigate(); //initialize usenavigate
    const location = useLocation(); 

    function handleClick() {
        if (location.state && location.state.invalidPost) {
            navigate('/home');
        } else {
            // if there's no previous page, go to home instead of crashing
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate('/home');
            }
        }
    }


    return(
        <>
            <div className={styles.container}>
                <h1>This page is not available</h1>
                <h5>The link you followed may be broken, or the page may have been deleted</h5>
                <img src={logo} className={styles.logo}/>
                <button className={styles.returnbutton} onClick={handleClick}>Return to previous page</button>
            </div>

        </>
    )
}

export default Error