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
import { API_URL, getLocalJSON, getVariable, isArray, isEmpty, isNil, isNull, isObject } from "../../../globals";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { ListItem } from "../ListItem";

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

    const { POST } = useApi(API_URL, useSelector(state => state.user.data.token));

    useEffect(() => {
        POST(`interventions/${interventionTypeFilter}`)
            .then(interventions => {
                console.log("Interventions GET success.");
                dispatch(setInterventionsFromType({ type: interventionTypeFilter, interventions }))
            })
            .catch(err => console.error("Interventions GET error.", err));
    }, [interventionTypeFilter]);

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

    const interventionTest = {
        ref: "#435627",
        rowid: "10",
        customer: {
            rowid: "159",
            name: "AMAZON EU SARL",
            address: "38, AVENUE JOHN F. KENNEDY, L-1855 LUXEMBOURG",
            country: {
                label: "-"
            }
        },
        ref: "(PROV10)",
        ref_client: "d\u00e9tail de la ref client",
        description: "installation rapide",
        note_public: "a faire ",
        intervention_address: "2",
        date_inter: 1706648400,
        event_type: "Rendez-vous"
    };

    // const config = {
    //     ref: { visible: true, label: "Référence" },
    //     description: { visible: false, label: "Description" },
    //     note_public: { visible: true, label: "Note publique" },
    //     date_inter: { visible: true, label: "Date d'intervention" },
    //     event_typ: { visible: true, label: "Type d'évènement" },
    //     event_ty: { visible: true, label: "Type d'évènement" },
    //     event_t: { visible: true, label: "Type d'évènement" },
    //     event_: { visible: true, label: "Type d'évènement" },
    //     event: { visible: true, label: "Type d'évènement" },
    //     even: { visible: true, label: "Type d'évènement" },
    //     eve: { visible: true, label: "Type d'évènement" }
    // }

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
        <div className={`fixed inset-0 bg-medium-bg text-strong-text`}>
            <Panel
                isOpen={!isNil(selectedIntervention)}
                close={() => set("selectedIntervention", null)}
                Overlay={{
                    overlayProps: { className: "z-60" }
                }}
                panelProps={{
                    className: "z-70"
                }}
            >
                <div className={`mx-auto w-app-xl h-app-xs bg-border rounded-full`} />
                <div className="text-app-2xl text-center font-app-bold">
                    {interventionTest.ref}
                </div>
                <div className={`overflow-y-auto flex flex-col border border-border divide-y divide-border rounded-md`}>
                    {!isNil(config) && Object.entries(config).map(([attributeKey, attribute], AI) => {
                        const { label, type, visible } = attribute;
                        if (type === "object") {
                            return (
                                <details>
                                    <summary className="flex font-app-bold px-4 py-3 first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                                        {label}
                                    </summary>
                                    <div className={`flex flex-col divide-y divide-border`}>
                                        {Object.entries(attribute).map(([objectAttributeKey, objectAttribute], AI) => {
                                            const { label, visible } = objectAttribute
                                            const test = ["type", "label", "position", "visible"];
                                            if (isArray(visible) && visible.includes("read") && !test.includes(objectAttributeKey)) {
                                                return (
                                                    <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                                                        <div className={`ml-app-base text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                                                            {label}
                                                        </div>
                                                        <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                                                            {!isObject(selectedIntervention?.[attributeKey]?.[objectAttributeKey]) && selectedIntervention?.[attributeKey]?.[objectAttributeKey]}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </details>
                            );
                        } else {
                            const { visible } = attribute;
                            if (isArray(visible) && visible.includes("read")) {
                                return (
                                    <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                                        <div className={`text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
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
                rightLinks={[{ icon: <FaMagnifyingGlass />, onClick: () => openSearchbar() }]}
                navbarProps={{ className: "shadow-none" }}
                bottomLinkProps={{
                    className: " border-none"
                }}
                // bottomLinkProps={{
                //     className: "border-none"
                // }}
                // left={<Button icon={<IoHome />} buttonProps={{ className: "px-app-xs py-app-xs text-app-lg" }} />}
                // right={<Button icon={<FaMagnifyingGlass />} buttonProps={{ className: "px-app-xs py-app-xs text-app-lg" }} />}
                // left={<NavbarUpperLink Button={{ icon: <IoHome /> }} />}
                // right={<NavbarUpperLink Button={{ icon: <FaMagnifyingGlass /> }} />}
                // bottomButtons={[
                //     { children: "Mes interventions", >},
                //     { children: "Urgentes", icon: <IoIosWarning />},
                //     { children: "Non attribuées", icon: <FaQuestion />},
                //     // { to: "Accueil", icon: <IoEllipsisHorizontal /> },
                // ]}
                // links={list}
            />
            {/* <div className={`overflow-y-auto mb-30 inset-shadow-xs`}>

            </div> */}
            <Calendar
                // containerProps={{ className: "mt-app-base" }}
            />

            {!isNil(interventions) && !isEmpty(interventions) 
                &&  <Block
                        title={"Interventions"}
                        // header={"Toutes ces interventions sont à faire en urgence.q dq sd qs d qs d qsd qsdqsdqsd qsdqsds"}
                        // footer={"Toutes ces interventions sont à faire en urgence."}
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
                
    

            <Popup
                // isOpen={isSidebarOpen}
                close={() => set("isSidebarOpen", false)}
                closeButton
                title={`Bonjour`}
            >
                popupBackdroppokhhkhkhkh
                sdfsdfsdfv qs dqsd qsd rg ev r ds df sdf ?
            </Popup>

            {/* <Tabbar 
                id={"TabbarTest"}
                links={links}
            /> */}
            {/* <Sidebar
                id={"sidebarTest"}
                toggleButton
                open={() => set("isSidebarOpen", true)}
                links={links}
                Panel={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false)
                }}
            /> */}
            <div className={`z-30 flex items-center ${isSearchbarOpen ? "translate-y-0" : "-translate-y-full"} p-app-base duration-(--quick) fixed top-0 left-0 h-(--interventionsNavbar-upper-navbar-height) right-0 bg-soft-bg text-soft-text`}>
                <Input
                    value={searchbarValue}
                    onChange={value => set("searchbarValue", value)}
                    placeholder={`Rechercher ...`}
                    ref={searchbarInputRef}
                    containerProps={{ className: "grow" }}
                    inputContainerProps={{ className: "border-none has-[input:focus]:ring-0" }}
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

            {/* <Button
                icon={!isSearchbarOpen && <FaMagnifyingGlass />}
                buttonProps={{ 
                    disabled: isSearchbarOpen,
                    onClick: () => !isSearchbarOpen && set("isSearchbarOpen", !isSearchbarOpen),
                    className: `p-4 fixed right-app-base bottom-app-base bg-soft-bg shadow-md text-primary
                    ${isSearchbarOpen ? "left-20" : ""}`
                }}
            >
                {isSearchbarOpen
                    ?  <>
                        <Input
                            inputContainerProps={{ className: "p-0 border-none has-[input:focus]:border-none has-[input:focus]:ring-0 ring-none" }}
                        />
                        <RiCloseLargeFill />
                        </>
                    : "Rechercher"
                }
            </Button> */}
            {/* <Sidebar
                toggleButton
                open={() => set("isSidebarOpen", true)}
                links={links}
                Panel={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false),
                    panelProps: {
                        className: `left-auto ${isSidebarOpen ? "right-0" : "-right-(--panel-width)"}`
                    }
                }}
                Button={{
                    buttonProps: {
                        className: "right-auto -left-17"
                    }
                }}
            /> */}


            {/* <Sidebar 
                floatingButton
                toggle={() => set("isSidebarOpen", !isSidebarOpen)}
                Popup={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false)
                }}
            >
                <SidebarLink
                    closeSidebar={() => set("isSidebarOpen", false)}
                    LazyLink={{
                        duration: 300,
                        Link: {
                            to: "/test",
                        }
                    }}
                    Button={{
                        icon: <IoHome />,
                        text: "Accueil"
                    }}
                />
                <SidebarLink
                    closeSidebar={() => set("isSidebarOpen", false)}
                    LazyLink={{
                        Link: {
                            // to: "/list"
                        }
                    }}
                    Button={{
                        icon: <FaBook />,
                        text: "Interventions"
                    }}
                />    
                <SidebarLink
                    label={`Interventions`}
                    to={`/`}
                    icon={<FaBook />}
                />
                <SidebarLink
                    label={`Urgentes`}
                    to={`/`}
                    icon={<IoIosWarning />}
                />
                <SidebarLink
                    label={`Non attribuées`}
                    to={`/`}
                    icon={<FaQuestion />}
                />
                <SidebarLink
                    label={`Paramètres`}
                    to={`/`}
                    icon={<FaGear />}
                />
            </Sidebar> */}
        </div>
    );
}

export default InterventionsPage;