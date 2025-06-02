import { useApi, useStates } from "../../../hooks";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../globals";
import { useEffect } from "react";
import { setInterventions, setInterventionsFromType, setMyInterventions, setUrgentInterventions } from "../../../reduxStore/reducers/interventionsSlice";
import { setConfig } from "../../../reduxStore/reducers/configSlice";
import { removeUpdate } from "../../../reduxStore/reducers/updatesSlice";

// TODO Conditions get home

const LoadingPage = () => {
    // useSelector(state => state.user.token)
   
    
    return (
        <div className={`flex flex-col gap-2 justify-center items-center fixed inset-0`}>
            <div className={`flex flex-col justify-center items-center gap-6 bg-soft-bg absolute inset-0`}>
                <img 
                    src={icon}
                    className={`size-32`}
                />
                <div className={`flex justify-center gap-2`}>

                    <Spinner />
                    
                </div>
                <button 
                    onClick={handleLogoutButtonOnClick}
                    className={`p-2 rounded-md bg-red-500 text-white uppercase`}
                >
                    Déconnexion
                </button>
            </div>
            {/* <div className={`col gap-2`}>
                <div className={`size-8 bg-[#f72d40]`} />
                <div className={`size-8 bg-[#ff3d47]`} />
                <div className={`size-8 bg-[#fed769]`} />
                <div className={`size-8 bg-[#fccb4f]`} />
                <div className={`size-8 bg-[#edeef2]`} />
                <div className={`size-8 bg-[#e0e1ec]`} />
                <div className={`size-8 bg-[#b3b6c5]`} />
                <div className={`size-8 bg-[#423751]`} />
                <div className={`size-8 bg-[#312944]`} />
            </div> */}
        </div>
    );
};

export default LoadingPage;
