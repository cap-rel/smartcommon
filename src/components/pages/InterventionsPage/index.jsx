import { IoFilter, IoHome, IoLogOut, IoWarning } from "react-icons/io5";
import { Navbar, Sidebar, Tabbar } from "../../navigation";
import { FaCalendarDays, FaGear, FaMagnifyingGlass } from "react-icons/fa6";
import { FaBook, FaQuestion, FaUser } from "react-icons/fa";
import { IoIosArrowForward, IoIosWarning } from "react-icons/io";
import { Block, Button, Panel, Popup } from "../../others";
import { useApi, useStates } from "../../../hooks";
import { useEffect, useRef } from "react";
import { Calendar } from "../../list";
import { Input } from "../../form";
import { RiCloseLargeFill, RiCloseLargeLine } from "react-icons/ri";
import { API_URL, getLocalJSON, getVariable, isArray, isEmpty, isNil, isNull, isObject, isUndefined } from "../../../globals";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { ListItem } from "../ListItem";
import { Page } from "../../others/Page";

// TODO Edit or Start depends on status

const InterventionsPage = () => {
    const dispatch = useDispatch();

    const { states, set } = useStates({
        isSidebarOpen: false,
        isSearchbarOpen: false,
        searchbarValue: "",
        selectedIntervention: null,
        interventionTypeFilter: "mine",
        dateInterval: Math.round(Date.now() / 1000)
    });

    const { interventionTypeFilter, isSidebarOpen, isSearchbarOpen, searchbarValue, selectedIntervention, dateInterval } = states;

    const { POST } = useApi(API_URL, useSelector(state => state.session.data.auth.token));

    useEffect(() => {
        if (interventionTypeFilter) {
            POST(`interventions/${interventionTypeFilter}`)
            .then(interventions => {
                console.log("Interventions GET success.");
                dispatch(setInterventionsFromType({ type: interventionTypeFilter, interventions }))
            })
            .catch(err => console.error("Interventions GET error.", err));
        }
    }, [interventionTypeFilter]);

    console.log(useSelector(state => state.interventions.data));

    const interventions = useSelector(state => state.interventions.data[interventionTypeFilter]);
    // const config = useSelector(state => state.config);

    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <FaBook />, to: "/interventions" },
        // { label: "Contacts", icon: <FaUser />, to: "/contacts" },
        { label: "Paramètres", icon: <FaGear />, to: "/settings" },
    ];

    const navbarLinks = [
        { label: "Mes Interventions", icon: <FaBook />, onClick: () => set("interventionTypeFilter", "mine"), active: interventionTypeFilter === "mine" },
        { label: "Urgentes", icon: <IoIosWarning />, onClick: () => set("interventionTypeFilter", "urgent"), active: interventionTypeFilter === "urgent" },
        { label: "Non attribuées", icon: <FaQuestion />, onClick: () => set("interventionTypeFilter", "unassigned"), active: interventionTypeFilter === "unassigned" },
    ];

    const config = useSelector(state => state.config.data);

    const searchbarInputRef = useRef();

    const openSearchbar = () => {
        set("isSearchbarOpen", true);
        searchbarInputRef.current.focus();
    };

    const resetOrCloseSearchbar = () => {
        if (!isEmpty(searchbarValue)) {
            set("searchbarValue", "");
        } else {
            set("isSearchbarOpen", false);
        }
    };

    return (
        <Page>
            <Panel
                isOpen={!isNil(selectedIntervention)}
                close={() => set("selectedIntervention", null)}
                zIndex={60}
            >
                <div className={`mx-auto w-app-xl h-app-xs bg-border rounded-full`} />
                <div className="text-app-xl text-center font-app-bold">
                    {selectedIntervention?.ref}
                </div>
                <div className={`overflow-y-auto flex flex-col border border-border divide-y divide-border rounded-md`}>
                    {!isNil(config) && Object.entries(config).map(([attributeKey, attribute], AI) => {
                        const { label, type, visible } = attribute;
                        if (type === "object") {
                            // return (
                            //     <details>
                            //         <summary className="flex font-app-bold px-4 py-3 first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                            //             {label}
                            //         </summary>
                            //         <div className={`flex flex-col divide-y divide-border`}>
                            //             {Object.entries(attribute).map(([objectAttributeKey, objectAttribute], AI) => {
                            //                 const { label, visible } = objectAttribute
                            //                 const test = ["type", "label", "position", "visible"];
                            //                 if (isArray(visible) && visible.includes("read") && !test.includes(objectAttributeKey)) {
                            //                     return (
                            //                         <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                            //                             <div className={`ml-app-base text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                            //                                 {label}
                            //                             </div>
                            //                             <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                            //                                 {!isObject(selectedIntervention?.[attributeKey]?.[objectAttributeKey]) && selectedIntervention?.[attributeKey]?.[objectAttributeKey]}
                            //                             </div>
                            //                         </div>
                            //                     );
                            //                 }
                            //             })}
                            //         </div>
                            //     </details>
                            // );
                        } else {
                            const { visible } = attribute;
                            if (isArray(visible) && visible.includes("read")) {
                                return (
                                    <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                                        <div className={`text-strong-text basis-1/2 px-app-sm py-app-xs font-app-semibold`}>
                                            {label}
                                        </div>
                                        <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                                            {!isObject(selectedIntervention?.[attributeKey]) && selectedIntervention?.[attributeKey]}
                                        </div>
                                    </div>
                                )
                            }                
                        }
                        // if (isArray(visible) && visible.includes("read")) {
                        //     return (<div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                        //         <div className={`text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                        //             {label}
                        //         </div>
                        //         <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                        //             {!isObject(selectedIntervention?.[attributeKey]) && selectedIntervention?.[attributeKey]}
                        //         </div>
                        //     </div>)
                        // }                           
                    })}
                </div>
                <Link to={`/intervention/${selectedIntervention?.rowid}`} state={{ originLocation: { to: "/interventions", state: { interventionTypeFilter } } }}>
                    <Button
                        buttonProps={{
                            className: "w-full"
                        }}
                    >
                        Commencer l'intervention
                    </Button>
                </Link>
            </Panel>
            <Navbar
                id={`interventionsNavbar`}
                title={`Interventions`}
                bottomLinks={navbarLinks}
                leftLinks={[{ icon: <FaCalendarDays /> }]}
                rightLinks={[{ icon: <FaMagnifyingGlass />, onClick: (e) => { e.preventDefault(); openSearchbar(); } }]}
                navbarProps={{ className: "shadow-none" }}
                bottomLinkProps={{
                    className: " border-none"
                }}
            />
            <Calendar
                // containerProps={{ className: "mt-app-base" }}
            />

            {!isNil(interventions) && !isEmpty(interventions) 
                &&  <Block
                        title={"Interventions"}
                        blockProps={{ className: "border-none p-0 gap-0" }}
                    >
                        <div className="flex flex-col divide-y divide-border">
                            {interventions.map((intervention, II) => 
                                <ListItem
                                    onClick={() => set("selectedIntervention", intervention)}
                                    intervention={intervention}
                                />
                            )}
                        </div>
                    </Block>
            }
                
            <div className={`z-30 flex items-center ${isSearchbarOpen ? "translate-y-0" : "-translate-y-full"} p-app-base duration-(--quick) fixed top-0 left-0 h-(--interventionsNavbar-upper-navbar-height) right-0 bg-soft-bg text-soft-text`}>
                <Input
                    value={searchbarValue}
                    onChange={value => set("searchbarValue", value)}
                    placeholder={`Rechercher ...`}
                    containerProps={{ className: "grow" }}
                    inputContainerProps={{ className: "border-none has-[input:focus]:ring-0" }}
                    inputProps={{
                        ref: searchbarInputRef,
                        className: "text-app-base"
                    }}
                />
                <Button
                    icon={<RiCloseLargeLine />}
                    onClick={() => resetOrCloseSearchbar()}
                    buttonProps={{ className: "bg-soft-bg text-soft-text p-app-xs rounded-app-extrabold" }}
                />
            </div>

            <Tabbar
                links={links}
            />  
        </Page>
    );
}

export default InterventionsPage;