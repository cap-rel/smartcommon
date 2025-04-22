import { IoHome, IoLogOut } from "react-icons/io5";
import { Navbar, Sidebar } from "../../navigation";
import { FaBook, FaSyncAlt } from "react-icons/fa";
import { FaBell, FaDatabase, FaFilePen, FaGear, FaUser } from "react-icons/fa6";
import { useApi, useStates } from "../../../hooks";
import { Block } from "../../others";
import { Calendar } from "../../list";
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { API_URL, isEmpty, setLocalJSON } from "../../../globals";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { setConfig } from "../../../reduxStore/reducers/configSlice";
import { removeUpdate } from "../../../reduxStore/reducers/updatesSlice";

const HomePage = () => {
    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <FaBook />, to: "/interventions" },
        { label: "Contacts", icon: <FaUser />, to: "/" },
        { label: "Paramètres", icon: <FaGear />, to: "/" },
        { label: "Déconnexion", icon: <IoLogOut />, to: "/" },
    ];

    const { states, set } = useStates({
        isSidebarOpen: false,
        isGettingData: false
    });

    const { isSidebarOpen, isGettingData } = states;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { GET, PUT } = useApi(API_URL, "test");

    const interventionsTypes = ["mine", "urgent", "unassigned"];

    const getInterventions = (type) => {
        GET(type === "mine" ? "interventions" : `interventions/${type}`)
            .then(json => {
                dispatch(setInterventionsFromType(type, json))
            })
            .catch(err => {
                console.log(err)
            });
    };

    const updates = useSelector(state => state.updates);

    const sync = () => {
        set("isGettingData", true);
        if (1 === 2) {
            GET("home")
                .then(json => {
                    dispatch(setConfig(json.home))
                })
                .catch(err => {
                    console.log(err)
                });

            updates.forEach((update, UI) => {
                PUT(`interventions/${update.data.rowid}`)
                    .then(json => removeUpdate(UI))
                    .catch(err => {
                        console.log(err)
                    });
            });

            interventionsTypes.forEach(type => getInterventions(type));
            
        }
        set("isGettingData", false);
    }
    
    return (
        <div className={`fixed inset-0 bg-medium-bg flex flex-col gap-app-base`}>            <Navbar
                title={`Accueil`}
                leftLinks={[{ icon: <FaSyncAlt /> }]}
                rightLinks={[{ icon: <FaBell /> }]}
            />
                <Block
                    title={"A syncrhoniser"} 
                    blockProps={{ className: "shadow-none" }}
                >
                    {!isEmpty(validatedUpdates)
                        ?   validatedUpdates.map((update, UI) =>
                                <div className={`flex items-center gap-app-xs text-soft-text`}>
                                    <FaDatabase className="text-primary text-xl"/>
                                    Aucune donnée
                                </div>
                            )
                        :   <div className={`flex items-center gap-app-xs text-soft-text`}>
                                <FaDatabase className="text-primary text-xl"/>
                                Aucune donnée
                            </div>
                    }
                </Block>
                <Block
                    title={"En cours"} 
                    blockProps={{ className: "shadow-none" }}
                >
                    <div className={`flex items-center gap-app-xs text-soft-text`}>
                        <FaFilePen className="text-primary text-xl"/>
                        Aucune intervention
                    </div>
                </Block>
                <Block
                    title={"A faire"} 
                    blockProps={{ className: "p-0 gap-0 shadow-none" }}
                >
                    <Calendar containerProps={{ className: "rounded-x-md rounded-t-md shadow-none" }}/>
                    <div className={`flex flex-col divide-y divide-border`}>
                        {["", "", "", ""].map(intervention => 
                            <div className="p-3 flex justify-between items-center gap-2">
                                <FaBook className="text-primary text-lg"/>
                                Troisième intervention
                                <div className="italic text-soft-text">18:10</div>
                                <IoIosArrowForward />
                            </div>

                        )}
                    </div>
                </Block>
            <Sidebar
                id={"homeSidebar"}
                toggleButton
                open={() => set("isSidebarOpen", true)}
                links={links}
                Panel={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false)
                }}
            />
        </div>
    );
};

export default HomePage;
