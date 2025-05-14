import { IoArrowForward, IoHome, IoLogOut } from "react-icons/io5";
import { Navbar, Sidebar, Tabbar } from "../../navigation";
import { FaBook, FaSyncAlt } from "react-icons/fa";
import { FaBell, FaDatabase, FaFilePen, FaGear, FaUser } from "react-icons/fa6";
import { useApi, useStates } from "../../../hooks";
import { Block, Button, Overlay, Popup } from "../../others";
import { Calendar } from "../../list";
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { API_URL, isEmpty, setLocalJSON } from "../../../globals";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { setConfig } from "../../../reduxStore/reducers/configSlice";
import { removeUpdate } from "../../../reduxStore/reducers/updatesSlice";
import toast from "react-hot-toast";
import { BsRocketFill } from "react-icons/bs";
import { MdArrowForwardIos } from "react-icons/md";
import { ListItem } from "../ListItem";
import { setIsTokenChecked } from "../../../reduxStore/reducers/sessionSlice";
import { Page } from "../../others/Page";

const HomePage = () => {
    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <BsRocketFill />, to: "/interventions" },
        // { label: "Contacts", icon: <FaUser />, to: "/contacts" },
        { label: "Paramètres", icon: <FaGear />, to: "/settings" },
        // { label: "Déconnexion", icon: <IoLogOut />, to: "/" },
    ];

    const { states, set } = useStates({
        isSidebarOpen: false,
        isGettingData: false,
        isSyncPopupOpen: false,
        isConfigSyncSuccess: false,
        isMyInterventionsSyncSuccess: false,
        isUrgentInterventionsSyncSuccess: false,
        isUnassignedInterventionsSyncSuccess: false,
        isUpdatesSyncSuccess: false,
        syncUpdateIndex: null,



        isConfigSyncing: false,
        isMineInterventionsSyncing: false,
        isUrgentInterventionsSyncing: false,
        isUnassignedInterventionsSyncing: false,
    });

    const { 
        isSidebarOpen, 
        isGettingData, 
        isSyncPopupOpen, 
        isConfigSyncSuccess,
        isMyInterventionsSyncSuccess,
        isUrgentInterventionsSyncSuccess,
        isUnassignedInterventionsSyncSuccess,
        isUpdatesSyncSuccess,
        syncUpdateIndex,

        isConfigSyncing,
        isMineInterventionsSyncing,
        isUrgentInterventionsSyncing,
        isUnassignedInterventionsSyncing,
    } = states;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const session = useSelector(state => state.session.data);

    const { POST, GET, PUT } = useApi(API_URL, session.auth.token);

    const isSyncing = isConfigSyncing || isMineInterventionsSyncing || isUrgentInterventionsSyncing || isUnassignedInterventionsSyncing;

    const interventionsTypes = {
        mine: { 
            isSyncing: "isMineInterventionsSyncing",
            toast: "Mise à jour des interventions à faire",
        },
        urgent: { 
            isSyncing: "isUrgentInterventionsSyncing",
            toast: "Mise à jour des interventions urgentes",
        },
        unassigned: { 
            isSyncing: "isUnassignedInterventionsSyncing",
            toast: "Mise à jour des interventions non assignées",
        },
    };

    const setToast = (toastId, isSyncing, toastText ,status = "success") => {
        setTimeout(() => {
            set(isSyncing, false);
            toast.dismiss(toastId);
            if (status === "error") {
                toast.error(toastText);
            } else {
                toast.success(toastText);
            }
        }, 1000);
    }

    const POSTIntervention = (type) => {
        const interventionType = interventionsTypes[type];
        const interventionToast = toast.loading(`${interventionType.toast}...`);

        POST(`interventions/${type}`)
            .then(json => {
                dispatch(setInterventionsFromType({ type, interventions: json }));
                setToast(interventionToast, interventionType.isSyncing, interventionType.toast);
                console.log(`"${type}" interventions GET success"`)
            })
            .catch(err => {
                setToast(interventionToast, interventionType.isSyncing, interventionType.toast, "success");
                console.error(`"${type}" interventions GET error`);
                console.error(err);
            })
    }

    const sync = () => {
        set("isConfigSyncing", true);

        const configToast = toast.loading("Mise à jour de la configuration...");

        GET("home")
            .then(json => {
                dispatch(setConfig(json.home));
                setToast(configToast, "isConfigSyncing", "Mise à jour de la configuration");
                console.log("Config GET success.");
            })
            .catch(err => {
                setToast(configToast, "isConfigSyncing", "Mise à jour de la configuration", "error");
                console.error("Config GET error");
                console.error(err);
            })
                
            POSTIntervention("mine");
            POSTIntervention("urgent");
            POSTIntervention("unassigned");
    };

    const syncUpdate = (index) => {
        const update = updates[index];
        set("syncUpdateIndex", index);
        setTimeout(() => {
            PUT(`intervention/${update.data.rowid}`)
                .then(() => {
                    dispatch(removeUpdate(index))
                    toast.success(`Intervention ${update.data.ref}`)
                    console.log(`Update { ref => ${update.data.ref}, index => ${index} } synchronization PUT Success`);
                })
                .catch(err => {
                    toast.error(`Intervention ${update.data.ref}`)
                    console.error(`Update { ref => ${update.data.ref}, index => ${index} } synchronization PUT Error`);
                    console.error(err);
                })
                .finally(() => {
                    set("syncUpdateIndex", null);
                })
        }, 1000)
    };

    useEffect(() => {
        if (!session.isTokenChecked) {
            GET("ping")
                .then(() => {
                    dispatch(setIsTokenChecked(true));
                    console.log("Token still valid.")
                })
                .catch(err => {
                    toast.error("Votre session a expirée. Veuillez vous reconnecter.");
                    console.error("Token expired. Must connect.");
                });
        }
    }, []);

    const updates = useSelector(state => state.updates.data);
    const drafts = useSelector(state => state.drafts.data);

    return (
        <Page>
            <Overlay
                isOpen={isSyncing}
                overlayProps={{ className: "" }}
            />
            {/* <Popup
                title={`Synchronisation serveur`}
                closeButton
                close={() => set("isSyncPopupOpen", false)}
                isOpen={isSyncPopupOpen}
                popupProps={{ className: "gap-app-md items-center" }}
                Button={{
                    buttonProps: {
                        disabled: isGettingData
                    }
                }}
            >
                <div className="text-center">
                    Pour synchroniser les données locales avec celles du serveur, appuyer ci-dessous.
                </div>
                <Button
                    icon={<FaSyncAlt />}
                    iconProps={{
                        className: `${isGettingData && "animate-spin"}`
                    }}
                    buttonProps={{
                        onClick: () => sync(),
                        className: "self-center text-5xl p-app-md"
                    }}
                />
                {isGettingData &&
                    <div className="text-soft-text italic">
                        Synchronisation en cours ...
                    </div>
                }
            </Popup>             */}
            <Navbar
                title={`Accueil`}
                leftLinks={[{ icon: <FaSyncAlt />, onClick: () => sync() }]}
                rightLinks={[{ icon: <FaBell /> }]}
            />
                <Block
                    title={"Aujourd'hui"} 
                    blockProps={{ className: "p-0 gap-0 border-none" }}
                >
                    <Link to={`/interventions`}>
                        {/* <Calendar containerProps={{ className: "rounded-x-md rounded-t-md shadow-none" }}/> */}
                        <div 
                            className={`flex items-center gap-app-sm text-soft-text px-app-base py-app-sm bg-soft-bg active:brightness-soft`}
                        >
                            <div className="p-app-sm bg-primary/10 rounded-app-md">
                                <BsRocketFill className={`text-primary text-2xl`} /> 
                            </div>

                            <div className="flex gap-app-sm items-center justify-between">
                                <div className="text-strong-text">
                                    Vous avez **** interventions à faire aujourd'hui... Y aller ?
                                </div>
                                <MdArrowForwardIos className="text-xl" />
                            </div>
                            
                        </div>
                    </Link>
                </Block>
                <Block
                    title={"A syncrhoniser"} 
                    blockProps={{ className: "border-none p-0" }}
                >
                    {!isEmpty(updates) 
                        ?   <div className="flex flex-col divide-y divide-border">
                                {updates.map((update, UI) => 
                                    <ListItem
                                        key={`update${UI}`}
                                        type={`update`}
                                        intervention={{ ...update.data, status: "update" }}
                                        onClick={() => syncUpdate(UI)}
                                    />
                                )}
                            </div>
                        :   <div className={`px-app-base py-app-sm`}>
                                Aucune intervention à synchroniser
                            </div>
                    }
                </Block>
                {/* <Block
                    title={"Brouillons"} 
                    containerProps={{ className: "mb-22" }}
                    blockProps={{ className: "border-none p-0" }}
                >
                    {!isEmpty(drafts) 
                        ?   <div className="flex flex-col divide-y divide-border">
                                {drafts.map((draft, DI) => 
                                    <Link 
                                        key={`draft${DI}`} 
                                        to={`/intervention/${draft.data.rowid}`} 
                                        state={{ draft: draft, originLocation: { to: "/" } }}
                                    >
                                        <ListItem
                                            type={`draft`}
                                            intervention={{ ...draft.data, status: "draft" }}
                                        />
                                    </Link>
                                )}
                            </div>
                        :   <div className={`px-app-base py-app-sm`}>
                                Aucun Brouillon
                            </div>
                    }
                </Block> */}
                <Tabbar links={links} />
        </Page>
    );
};

export default HomePage;
