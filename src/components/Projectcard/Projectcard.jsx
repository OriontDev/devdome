import styles from './Projectcard.module.css';
import { useNavigate } from "react-router-dom";

function Projectcard( {name, description, images, comments, likes, projectId} ){

    const navigate = useNavigate(); //initialize usenavigate

    return(
        <>
            <div className={styles.container} onClick={() => navigate(`/project/${projectId}`)}>
                <div className={styles.titlecontainer}>
                    <h1 className={styles.title}>{name}</h1>
                </div>
                <div className={styles.contentcontainer}>
                    {/* if length more than 350,slice and add ... at the end */}
                    <div className={styles.descriptioncontainer}>
                       <p className={styles.description}>{description.length > 400 ? description.slice(0, 400) + "..." : description}</p>
                    </div>

                    <img className={styles.image} src={images}/>
                    <div className={styles.reactioncontainer}>
                        <h2>❤️{likes}</h2>
                        <h2>💬{comments}</h2>
                    </div>
                </div>


            </div>
        </>
    );
}

export default Projectcard