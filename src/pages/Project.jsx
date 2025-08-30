import Header from "../components/Header/Header.jsx";
import { useParams } from "react-router-dom";

function Project(){
    const { id } = useParams(); // get projectId from URL
    // fetch project data from Firebase using id
    console.log(id);
    return(
        <>

        </>
    );
}

export default Project