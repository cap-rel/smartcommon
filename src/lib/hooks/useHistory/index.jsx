import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalStates } from "../export";

export const useHistory = () => {
    const initialStates = {};
    const {} = useGlobalStates({  });

    const navigate = useNavigate();
    const location = useLocation();
    
    const history = {};

    return { navigate, location, history };
};