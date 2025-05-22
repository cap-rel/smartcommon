import { IoFilter, IoHome, IoLogOut, IoWarning } from "react-icons/io5";
import { LowerNavbarLink, Navbar, Sidebar, Tabbar, UpperNavbarLink } from "../../navigation";
import { FaCalendarDays, FaGear, FaMagnifyingGlass } from "react-icons/fa6";
import { FaBook, FaQuestion, FaUser } from "react-icons/fa";
import { IoIosArrowForward, IoIosWarning } from "react-icons/io";
import { Block, Button, Panel, Popup } from "../../others";
import { useApi, useStates } from "../../../hooks";
import { useEffect, useRef } from "react";
import { Input, Calendar } from "../../form";
import { RiCloseLargeFill, RiCloseLargeLine } from "react-icons/ri";
import { API_URL, cleanForComparison, formatDate, getLocalJSON, getVariable, isArray, isEmpty, isNil, isNull, isObject, isUndefined, searchBarFilter, timestampToDate } from "../../../globals";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setInterventionsFromType } from "../../../reduxStore/reducers/interventionsSlice";
import { ListItem } from "../ListItem";
import { Page } from "../../others/Page";
import { DetailsPanel } from "../DetailsPanel";

// TODO Edit or Start depends on status
// TODO date interval

const InterventionsPage = () => {
    const dispatch = useDispatch();

    const dateNow = formatDate(new Date());

    const { isInCalendarModeByDefault } = useSelector(state => state.settings.data);

    const { states, set } = useStates({
        isInCalendarMode: isInCalendarModeByDefault,
        isSearchbarOpen: false,
        search: "",
        selectedIntervention: null,
        interventionTypeFilter: "mine",
        dateInterval: dateNow,
        isGettingInterventions: false
    });

    const { interventionTypeFilter, isSearchbarOpen, search, selectedIntervention, dateInterval, isInCalendarMode, isGettingIntervention } = states;

    const { token } = useSelector(state => state.session.data);

    const { POST } = useApi(API_URL, token);

    const interventions = useSelector(state => state.interventions.data[interventionTypeFilter]);

    const dateGroups = interventions.reduce((acc, intervention) => {
        const { date_inter, label, ref } = intervention;
        const dateGroup = formatDate(new Date(date_inter), "DD/MM/YYYY");
        if (
            searchBarFilter([ref, label], search)
            // date_inter >= dateInterval[0] &&
            // date_inter <= dateInterval[1]
        ) {
            if (isUndefined(acc[dateGroup])) {
                acc[dateGroup] = [];
            }
            acc[dateGroup] = [...acc[dateGroup], intervention];
        }
        return acc;
    }, {});

    useEffect(() => {
        if (interventionTypeFilter) {
            set("isGettingInterventions", true);
            POST(`interventions/${interventionTypeFilter}`)
                .then(interventions => {
                    dispatch(setInterventionsFromType({ type: interventionTypeFilter, interventions }));
                    set("isGettingInterventions", false);
                    console.log(`GET 'interventions/${interventionTypeFilter}' success`);
                })
                .catch(err => {
                    set("isGettingInterventions", false);
                    console.error(`GET 'interventions/${interventionTypeFilter}' error`)
                    console.error(err);
                });
            }
    }, [interventionTypeFilter]);

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
        if (!isEmpty(search)) {
            set("search", "");
        } else {
            set("isSearchbarOpen", false);
        }
    };

    const closePanel = () => {
        set("selectedIntervention", null);
    };

    return (
        <>
            <DetailsPanel
                intervention={selectedIntervention}
                close={closePanel}
                originLocation={{ to: "/interventions", state: { interventionTypeFilter } }}
            />

            <Page pageProps={{ className: `mb-(--layoutTabbar-tabbar-height)` }}>
                <Navbar
                    id={`interventionsNavbar`}
                    title={`Interventions`}
                    lowerLinks={navbarLinks.map((link, LI) => 
                        <LowerNavbarLink 
                            key={`link${LI}`}
                            { ...link}
                            linkProps={{ className: `${isInCalendarMode && "border-none"}` }} 
                        />
                    )}
                    upperLeftLinks={
                        <UpperNavbarLink 
                            icon={<FaCalendarDays />}
                            onClick={e => { 
                                e.preventDefault();
                                set("isInCalendarMode", !isInCalendarMode); 
                            }}
                            iconProps={{ className: `${isInCalendarMode ? "text-white" : "text-soft-text"}` }}
                        />
                    }
                    upperRightLinks={
                        <UpperNavbarLink 
                            icon={<FaMagnifyingGlass />}
                            onClick={e => { 
                                e.preventDefault();
                                openSearchbar(); 
                            }}
                        />
                    }
                    navbarProps={{ className: "shadow-none" }}
                />
                <Calendar
                    value={dateInterval}
                    onChange={value => set("dateInterval", value)}
                    containerProps={{ className: `top-(--interventionsNavbar-navbar-height) z-10 ${!isInCalendarMode && "absolute -translate-y-full"} duration-(--medium)` }}
                />

                <Block 
                    blockProps={{ className: `bg-transparent shadow-none flex justify-center items-center p-0` }}
                >
                    hey
                </Block>

                {!isEmpty(dateGroups) &&
                    Object.entries(dateGroups).map(([date, group], GI) => 
                        <Block
                            title={date}
                            blockProps={{ className: `p-0 gap-0 ${isInCalendarMode && "shadow-none bg-transparent"}` }}
                        >
                            <div className={`flex flex-col ${isInCalendarMode ? "gap-app-xs" : "divide-y divide-border"}`}>
                                {group.map((intervention, II) => 
                                    <ListItem
                                        isInCalendarMode={isInCalendarMode}
                                        type={"intervention"}
                                        key={`intervention${II}`}
                                        onClick={() => set("selectedIntervention", intervention)}
                                        intervention={intervention}
                                    />
                                )}
                            </div>
                        </Block>
                    )
                }
                    
                <div className={`z-30 flex -mx-app-xs text-app-lg items-center ${isSearchbarOpen ? "translate-y-0" : "-translate-y-full"} p-app-base duration-(--quick) fixed top-0 left-0 h-(--interventionsNavbar-upper-navbar-height) right-0 bg-soft-bg text-soft-text`}>
                    <Input
                        icon={<FaMagnifyingGlass />}
                        value={search}
                        onChange={value => set("search", value)}
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
                        buttonProps={{ className: "bg-soft-bg text-app-lg text-soft-text p-app-xs rounded-app-xl" }}
                    />
                </div>

            </Page>
        </>
    );
}

export default InterventionsPage;