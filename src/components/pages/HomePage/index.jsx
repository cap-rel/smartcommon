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

        isSyncing: false,
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

        isSyncing
    } = states;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const session = useSelector(state => state.session.data);

    const { POST, GET, PUT } = useApi(API_URL, session.auth.token);

    const interventionsTypes = ["mine", "urgent", "unassigned"];

    const getInterventions = (type) => {
        POST(`interventions/${type}`)
            .then(json => {
                console.log(`"${type}"interventions GET success"`)
                dispatch(setInterventionsFromType(type, json))
            })
            .catch(err => {
                console.error(`"${type}" interventions GET error`);
                console.error(err);
            });
    };

    const updates = useSelector(state => state.updates.data);

    const toastStatus = {
        config: {
            loading: "Mise à jour de la configuration...",
            success: "Mise à jour",
            error: "Echec de la mise à jour"
        },
        updates:  {
            loading: "Envoi des comptes-rendus d'interventions non-synchronisés...",
            success: "Envoyés",
            error: "Echec de l'envoi"
        },
        interventions: {
            loading: "Mise à jour des interventions...",
            success: "Mises à jour",
            error: "Echec de la mise à jour"
        },
    }

    const { config: configStatus, updates: updatesStatus, interventions: interventionsStatus } = toastStatus;

    const sync = () => {
        set("isSyncing", true);

        const configToast = toast.loading(toast)
        GET("home")
            .then(json => {
                dispatch(setConfig(json.home));
                console.log("Config GET success.")
            })
            .catch(err => {
                console.error("Config GET error");
                console.error(err);
            });

        updates.forEach((update, UI) => {
            PUT(`intervention/${update.data.rowid}`)
                .then(() => {
                    dispatch(removeUpdate(UI))
                    console.log(`Update ${UI} synchronization PUT Success`);
                })
                .catch(err => {
                    console.error(`Update ${UI} synchronization PUT Error`);
                    console.error(err);
                });
        }),

        interventionsTypes.forEach(type => getInterventions(type));

        set("isSyncing", false);
    };

    const syncUpdate = (index) => {
        const update = updates[index];
        set("syncUpdateIndex", index);
        setTimeout(() => {
            PUT(`intervention/${update.data.rowid}`)
                .then(json => dispatch(removeUpdate(index)))
                .catch(err => {
                    console.log(err)
                });
            set("syncUpdateIndex", null);
            toast.success("Intervention synchronisée");
        }, 1000)
    };

    const drafts = useSelector(state => state.drafts.data);

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

    return (
        <div className={`fixed inset-0 bg-medium-bg overflow-y-auto`}>
            <Overlay
                isOpen={isSyncing}
                overlayProps={{ className: "bg-transparent" }}
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
        </div>
    );
};

export default HomePage;
