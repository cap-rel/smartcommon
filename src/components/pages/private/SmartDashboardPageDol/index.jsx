import { useDispatch } from "react-redux";
import { logoutSuccess } from "../../../../reduxStore/reducers/authSlice";
import { useApi } from "../../../hooks";

export const SmartDashboardPage = (props) => {
    const dispatch = useDispatch();
    const { logout } = useApi();

    return (
        <div
            className={`
                m-4 col bg-white dark:bg-dark p-6 rounded-md shadow-2xl text-gray-500 text-sm lg:absolute lg:inset-0
                `}
                // ${states.opacityTransitions.initial ? "duration-300 opacity-100" : "opacity-0"}
        >
            Tableau de bord
            <button 
                onClick={() => logout()}
                className={`p-3 font-semibold text-white bg-red-500 button-smt`}
            >
                Deconnexion
            </button>
        </div>
    );
};