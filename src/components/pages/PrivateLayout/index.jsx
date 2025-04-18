import { IoHome, IoWarning } from "react-icons/io5";
import { Navbar, Sidebar, Tabbar } from "../../navigation";
import { FaGear, FaMagnifyingGlass } from "react-icons/fa6";
import { FaBook, FaQuestion, FaSyncAlt, FaUser } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { Button } from "../../others";
import { useStates } from "../../../hooks";
import { useEffect } from "react";

const PrivateLayout = () => {
    const { states, set } = useStates({
        isSidebarOpen: false,
    });

    const { isSidebarOpen } = states; 

    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <FaBook />, to: "/list" },
        { label: "Contacts", icon: <FaUser />, to: "/" },
        { label: "Paramètres", icon: <FaGear />, to: "/" },
    ];

    return (
        <div className={`fixed inset-0 bg-medium-bg`}>
            <Navbar
                title={`Interventions`}
                bottomLinks={links}
                leftLinks={[{ icon: <IoHome /> }]}
                rightLinks={[{ icon: <FaMagnifyingGlass /> }]}
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

            <Tabbar 
                id={"TabbarTest"}
                links={links}
            />
            {/* <Sidebar
                id={"sidebarTest"}
                toggleButton
                open={() => set("isSidebarOpen", true)}
                links={links}
                Panel={{
                    isOpen: isSidebarOpen,
                    close: () => set("isSidebarOpen", false)
                }}
            />
            <Sidebar
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

export default PrivateLayout;