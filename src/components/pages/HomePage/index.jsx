import { IoArrowForward, IoHome, IoLogOut } from "react-icons/io5";
import { Navbar, Sidebar, Tabbar, UpperNavbarLink } from "../../navigation";
import { FaBook, FaCheckCircle, FaSyncAlt, FaTimesCircle } from "react-icons/fa";
import { FaBell, FaDatabase, FaFilePen, FaGear, FaUser } from "react-icons/fa6";
import { useApi, useStates } from "../../../hooks";
import { Block, Button, Overlay, Popup, Spinner } from "../../others";
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { API_URL, getSessionJSON, isEmpty, setLocalJSON, setSessionJSON, timeToMinutes } from "../../../globals";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { setConfig } from "../../../reduxStore/reducers/configSlice";
import { removeUpdate } from "../../../reduxStore/reducers/updatesSlice";
import toast from "react-hot-toast";
import { BsRocketFill } from "react-icons/bs";
import { MdArrowForwardIos } from "react-icons/md";
import { ListItem } from "../ListItem";
import { Page } from "../../others/Page";
import { PrivateLayout } from "../PrivateLayout";
import { DetailsPanel } from "../DetailsPanel";
import { Duration } from "../../list/Duration";
import { Address, Coordinates, Datetime, Email, PhoneNumber, Url } from "../../list";
import { Boolean, Input } from "../../form";

const HomePage = () => {

    const { states, set } = useStates({
        selectedIntervention: null,

        isUpdatesSyncSuccess: false,
        syncUpdateIndex: null,

        isSyncPopupOpen: false,
        hasSyncStarted: false,

        isConfigSyncing: false,
        isMineInterventionsSyncing: false,
        isUrgentInterventionsSyncing: false,
        isUnassignedInterventionsSyncing: false,

        isConfigSyncSuccess: false,
        isMineInterventionsSyncSuccess: false,
        isUrgentInterventionsSyncSuccess: false,
        isUnassignedInterventionsSyncSuccess: false,

        isFormSubmitted: false,
        errors: null,
    });

    const { 
        selectedIntervention,

        isUpdatesSyncSuccess,
        syncUpdateIndex,

        isSyncPopupOpen,
        hasSyncStarted,

        isConfigSyncing,
        isMineInterventionsSyncing,
        isUrgentInterventionsSyncing,
        isUnassignedInterventionsSyncing,

        isConfigSyncSuccess,
        isMineInterventionsSyncSuccess,
        isUrgentInterventionsSyncSuccess,
        isUnassignedInterventionsSyncSuccess,

        isFormSubmitted,
        errors
    } = states;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { token, user } = useSelector(state => state.session.data);

    const { POST, GET, PUT } = useApi(API_URL, token);

    const isOneSyncingAtLeast = isConfigSyncing || isMineInterventionsSyncing || isUrgentInterventionsSyncing || isUnassignedInterventionsSyncing;

    const syncRequests = {
        config: { 
            isSyncing: isConfigSyncing,
            isSyncSuccess: isConfigSyncSuccess,
            isSyncingPath: "isConfigSyncing",
            isSyncSuccessPath: "isConfigSyncSuccess",
            text: "Mise à jour de la configuration",
        },
        mine: { 
            isSyncing: isMineInterventionsSyncing,
            isSyncSuccess: isMineInterventionsSyncSuccess,
            isSyncingPath: "isMineInterventionsSyncing",
            isSyncSuccessPath: "isMineInterventionsSyncSuccess",
            text: "Mise à jour des interventions à faire",
        },
        urgent: { 
            isSyncing: isUrgentInterventionsSyncing,
            isSyncSuccess: isUrgentInterventionsSyncSuccess,
            isSyncingPath: "isUrgentInterventionsSyncing",
            isSyncSuccessPath: "isUrgentInterventionsSyncSuccess",
            text: "Mise à jour des interventions urgentes",
        },
        unassigned: { 
            isSyncing: isUnassignedInterventionsSyncing,
            isSyncSuccess: isUnassignedInterventionsSyncSuccess,
            isSyncingPath: "isUnassignedInterventionsSyncing",
            isSyncSuccessPath: "isUnassignedInterventionsSyncSuccess",
            text: "Mise à jour des interventions non assignées",
        },
    };

    const POSTIntervention = (type) => {
        const { isSyncingPath, isSyncSuccessPath } = syncRequests[type];
        // set(interventionType.isSyncing, true);

        POST(`interventions/${type}`)
            .then(json => {
                dispatch(setInterventionsFromType({ type, interventions: json }));
                set(isSyncingPath, false);
                set(isSyncSuccessPath, true);
                console.log(`POST 'interventions/${type} success`)
            })
            .catch(err => {
                set(isSyncingPath, false);
                console.error(`POST 'interventions/${type} error`);
                console.error(err);
            })
    }

    const sync = () => {
        set("hasSyncStarted", true);
        Object.values(syncRequests).forEach(request => set(request.isSyncingPath, true));

        const { isSyncingPath, isSyncSuccessPath } = syncRequests.config;

        setTimeout(() => {
            GET("home")
                .then(json => {
                    dispatch(setConfig(json.home));
                    set(isSyncingPath, false);
                    set(isSyncSuccessPath, true);
                    console.log("GET 'home' success");
                })
                .catch(err => {
                    set(isSyncingPath, false);
                    console.error("GET 'home' error");
                    console.error(err);
                });
                    
            POSTIntervention("mine");
            POSTIntervention("urgent");
            POSTIntervention("unassigned");
        }, 1000); 
    };

    const syncUpdate = (index) => {
        // const update = updates[index];
        // set("syncUpdateIndex", index);
        // setTimeout(() => {
        //     const { rowid: id, ref } = update.data;
        //     PUT(`intervention/${id}`)
        //         .then(() => {
        //             dispatch(removeUpdate({ user, index }));
        //             toast.success(`Synchronisation intervention ${ref}`);
        //             console.log(`PUT 'intervention/${id}' success`);
        //         })
        //         .catch(err => {
        //             toast.error(`Synchronisation intervention ${ref}`);
        //             console.error(`PUT 'intervention/${id}' success`);
        //             console.error(err);
        //         })
        // }, 1000)
    };

    useEffect(() => {
        if (!getSessionJSON("isTokenChecked")) {
            GET("ping")
                .then(() => {
                    setSessionJSON("isTokenChecked", true);
                    console.log("GET 'ping' success");
                    POSTIntervention("mine");
                    POSTIntervention("urgent");
                    POSTIntervention("unassigned");
                })
                .catch(err => {
                    console.error("GET 'ping' error");
                    console.error(err);
                });
        }
    }, []);

    const updates = useSelector(state => state.updates.data);

    const closePopup = () => {
        set("isSyncPopupOpen", false);
        set("hasSyncStarted", false);
        Object.values(syncRequests).forEach(request => set(request.isSyncSuccessPath, false));
    };

    let filterText;

    switch (useSelector(state => state.settings.data.interventionsFilterByDefault)) {
        case "today": filterText = "aujourd'hui"; break;
        case "week": filterText = "cette semaine"; break;
        case "month": filterText = "ce mois"; break;
    }

    const syncText = (request) => {
        const { isSyncing, isSyncSuccess, text } = request

        return (
            <div className={`flex gap-app-xs items-center`}>
                {isSyncing
                    ?   <Spinner size={5} />
                    :   (isSyncSuccess
                            ?   <FaCheckCircle className={`text-success text-app-lg`} />
                            :   <FaTimesCircle className={`text-error text-app-lg`} />
                        )
                }
                {text}
            </div>
        );
    };

    const interventions = Object.values(useSelector(state => state.interventions.data)).reduce((acc, interventionsGroup) => [...acc, ...interventionsGroup], []);

    const interventionsToComplete = interventions.filter(intervention => intervention.status === "STATUS_TOCOMPLETE");
    const interventionsInProgress = interventions.filter(intervention => intervention.status === "STATUS_INPROGRESS");

    const closePanel = () => {
        set("selectedIntervention", null);
    };

    const handleError = (error, value) => {
        set(`errors.${error}`, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        set("isFormSubmitted", true);
        if (!Object.values(errors).some(error => error)) {
            toast.success("Tous les champs formulaire sont valides");
        } else {
            toast.error("Vérifier les champs du formulaire");
        }
    }

    useEffect(() => console.log(errors), [errors]);

    return (
        <>
            <DetailsPanel
                intervention={selectedIntervention}
                close={closePanel}
                originLocation={{ to: "/interventions" }}
            />
            <Popup
                isOpen={isSyncPopupOpen}
                close={closePopup}
                title={`Synchronisation serveur`}
                closeButton
                popupProps={{ className: `items-center pb-app-md` }}
            >
                <div className={`text-justify`}>
                    Pour synchroniser la configuration de l'application ainsi que les interventions, cliquez sur le bouton ci-dessous.
                </div>

                <Button
                    icon={<FaSyncAlt />}
                    onClick={sync}
                    iconProps={{ className: `${isOneSyncingAtLeast && "animate-spin"} text-app-4xl` }}
                    buttonProps={{ className: `rounded-full p-app-base` }}
                />

                {/* {hasSyncStarted && */}
                    <div className={`
                        ${hasSyncStarted ? "scale-100 opacity-100 h-auto gap-app-sm" : "scale-0 opacity-0 h-0 gap-0"}
                        duration-(--medium) flex flex-col
                    `}>
                        {Object.values(syncRequests).map(request => syncText(request))}
                    </div>
                {/* } */}

            </Popup>
            <Page pageProps={{ className: `mb-(--layoutTabbar-tabbar-height)` }}>   
                <Navbar
                    title={`Accueil`}
                    upperLeftLinks={<UpperNavbarLink icon={<FaSyncAlt />} onClick={() => set("isSyncPopupOpen", true)} />}
                    upperRightLinks={<UpperNavbarLink icon={<FaBell />} />}
                />
                <Block
                    title={"Aujourd'hui"} 
                    blockProps={{ className: "p-0 gap-0" }}
                >
                    <Link to={`/interventions`}>
                        <div 
                            className={`flex items-center gap-app-sm text-soft-text px-app-base py-app-sm bg-soft-bg active:brightness-soft`}
                        >
                            <div className="p-app-sm bg-primary/10 rounded-app-md">
                                <BsRocketFill className={`text-primary text-2xl`} /> 
                            </div>

                            <div className="flex gap-app-sm items-center justify-between">
                                <div className="text-strong-text">
                                    Vous avez **** interventions à faire {filterText}... Y aller ?
                                </div>
                                <MdArrowForwardIos className="text-xl" />
                            </div>
                            
                        </div>
                    </Link>
                </Block>

                <Block
                    title={"A syncrhoniser"} 
                    blockProps={{ className: "p-0" }}
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
                <Block
                    title={"En cours"} 
                    blockProps={{ className: "p-0" }}
                >
                    {!isEmpty(interventionsInProgress) 
                        ?   <div className="flex flex-col divide-y divide-border">
                                {interventionsInProgress.map((intervention, II) => 
                                    <ListItem
                                        key={`intervention${II}`}
                                        type={`intervention`}
                                        onClick={() => set("selectedIntervention", intervention)}
                                        intervention={intervention}
                                    />
                                )}
                            </div>
                        :   <div className={`px-app-base py-app-sm`}>
                                Aucune intervention en cours
                            </div>
                    }
                </Block>
                <Block
                    title={"A compléter"} 
                    blockProps={{ className: "p-0" }}
                >
                    {!isEmpty(interventionsToComplete) 
                        ?   <div className="flex flex-col divide-y divide-border">
                                {interventionsToComplete.map((intervention, II) => 
                                    <ListItem
                                        key={`intervention${II}`}
                                        type={`intervention`}
                                        onClick={() => set("selectedIntervention", intervention)}
                                        intervention={intervention}
                                    />
                                )}
                            </div>
                        :   <div className={`px-app-base py-app-sm`}>
                                Aucune intervention en cours
                            </div>
                    }
                </Block>
                
            </Page>
        </>
    );
};

export default HomePage;


// const { errors } = useForm(config, formValues)