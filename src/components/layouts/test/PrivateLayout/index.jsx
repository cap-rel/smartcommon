import { Outlet } from "react-router-dom";
import { Navbar, Sidebar, SidebarLink, Tabbar, TabbarLink } from "../../../navigation";


export const PrivateLayout = () => {
    return (
        <div id="main" className="min-h-screen text-strong-text bg-soft">
            <div className={`relative mb-20 h-300`}>
                {/* <Navbar
                    title={`Accueil`}
                /> */}
                <Navbar title={`Accueil`}/>
                <Outlet />
                {/* <Sidebar>
                    <SidebarLink
                        label={`Accueil`}
                        to={`/`}
                        icon={{ library: "io5", name: "IoHome" }}
                    />
                    <SidebarLink
                        label={`Carnet`}
                        to={`/notes`}
                        icon={{ library: "fa", name: "FaBook" }}
                    />
                    <SidebarLink
                        label={`Synchroniser`}
                        to={`/sync`}
                        icon={{ library: "fa", name: "FaSyncAlt" }}
                    />
                    <SidebarLink
                        label={`Paramètres`}
                        to={`/settings`}
                        icon={{ library: "fa6", name: "FaGear" }}
                    />
                </Sidebar> */}
                <Tabbar>
                    <TabbarLink
                        label={`Accueil`}
                        to={`/`}
                        icon={{ library: "io5", name: "IoHome" }}
                    />
                    <TabbarLink
                        label={`Carnet`}
                        to={`/notes`}
                        icon={{ library: "fa", name: "FaBook" }}
                    />
                    <TabbarLink
                        label={`Synchroniser`}
                        to={`/sync`}
                        icon={{ library: "fa", name: "FaSyncAlt" }}
                    />
                    <TabbarLink
                        label={`Paramètres`}
                        to={`/settings`}
                        icon={{ library: "fa6", name: "FaGear" }}
                    />
                </Tabbar>
            </div>
        </div>
    );
};