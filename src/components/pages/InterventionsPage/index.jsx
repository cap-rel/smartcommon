import { IoFilter, IoHome, IoLogOut, IoWarning } from "react-icons/io5";
import { Navbar, Sidebar, Tabbar } from "../../navigation";
import { FaCalendarDays, FaGear, FaMagnifyingGlass } from "react-icons/fa6";
import { FaBook, FaQuestion, FaSyncAlt, FaUser } from "react-icons/fa";
import { IoIosArrowForward, IoIosWarning } from "react-icons/io";
import { Block, Button, Panel, Popup } from "../../others";
import { useStates } from "../../../hooks";
import { useEffect } from "react";
import { Calendar } from "../../list";
import { Input } from "../../form";
import { RiCloseLargeFill } from "react-icons/ri";
import { isNil, isNull } from "../../../globals";
import { useSelector } from "react-redux";

const InterventionsPage = () => {
    const { states, set } = useStates({
        isSidebarOpen: false,
        isSearchbarOpen: false,
        selectedIntervention: null
    });

    const { isSidebarOpen, isSearchbarOpen, selectedIntervention } = states;
    
    // const config = useSelector(state => state.config);

    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <FaBook />, to: "/list" },
        { label: "Contacts", icon: <FaUser />, to: "/" },
        { label: "Paramètres", icon: <FaGear />, to: "/" },
        { label: "Déconnexion", icon: <IoLogOut />, to: "/" },
    ];

    const navbarLinks = [
        { label: "Mes Interventions", icon: <FaBook />, active: true },
        { label: "Urgentes", icon: <IoIosWarning /> },
        { label: "Non attribuées", icon: <FaQuestion /> },
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

    const config = {
        ref: { visible: true, label: "Référence" },
        description: { visible: false, label: "Description" },
        note_public: { visible: true, label: "Note publique" },
        date_inter: { visible: true, label: "Date d'intervention" },
        event_type: { visible: true, label: "Type d'évènement" },
    }

    return (
        <div className={`fixed inset-0 overflow-y-auto bg-medium-bg text-strong-text`}>
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
                <div className="text-app-2xl text-center font-app-bold">
                    {interventionTest.ref}
                </div>
                <div className={`flex flex-col border border-border divide-y divide-border rounded-md`}>
                    {Object.entries(config).map(([attributeKey, attribute], AI) =>
                        attribute.visible && 
                        <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-strong-bg">
                            <div className={`text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                                {attribute.label}
                            </div>
                            <div className={`px-4 py-3 text-soft-text`}>
                                {interventionTest[attributeKey]}
                            </div>
                        </div>
                    )}
                </div>
            </Panel>
            <Navbar
                title={`Interventions`}
                bottomLinks={navbarLinks}
                leftLinks={[{ icon: <FaCalendarDays /> }]}
                rightLinks={[{ icon: <FaMagnifyingGlass /> }]}
                navbarProps={{ className: "shadow-none" }}
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
            <Block
                title={"12/03/2025"}
                // header={"Toutes ces interventions sont à faire en urgence.q dq sd qs d qs d qsd qsdqsdqsd qsdqsds"}
                // footer={"Toutes ces interventions sont à faire en urgence."}
                containerProps={{
                    className: "mt-app-base"
                }}
                blockProps={{
                    className: "border-none"
                }}
            >
                <div className="flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Première intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
            </Block>
            <Block
                title={"13/03/2025"}
                // header={"Toutes ces interventions sont à faire en urgence.q dq sd qs d qs d qsd qsdqsdqsd qsdqsds"}
                // footer={"Toutes ces interventions sont à faire en urgence."}
                containerProps={{
                    className: "mt-app-base"
                }}
                blockProps={{
                    onClick: () => set("selectedIntervention", interventionTest),
                    className: "border-none"
                }}
            >
                <div className="flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Seconde intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
            </Block>
            <Block
                title={"15/03/2025"}
                // header={"Toutes ces interventions sont à faire en urgence.q dq sd qs d qs d qsd qsdqsdqsd qsdqsds"}
                // footer={"Toutes ces interventions sont à faire en urgence."}
                containerProps={{
                    className: "mt-app-base"
                }}
                blockProps={{
                    className: "border-none p-0"
                }}
            >
                <div className="divide-y divide-border">
                    <div className="p-3 flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Troisième intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
                    <div className="p-3 flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Troisième intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
                    <div className="p-3 flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Troisième intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
                    <div className="p-3 flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Troisième intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>
                    <div className="p-3 flex justify-between items-center gap-2"><FaBook className="text-primary text-lg"/> Troisième intervention <div className="italic text-soft-text">18:10</div> <IoIosArrowForward /></div>

                </div>
            </Block>

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
            <Sidebar
                id={"sidebarTest"}
                toggleButton
                open={() => set("isSidebarOpen", true)}
                links={links}
                Panel={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false)
                }}
            />

            <Button
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
            </Button>
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