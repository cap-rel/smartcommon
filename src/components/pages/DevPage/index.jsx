import { Navbar, Sidebar, SidebarLink, Tabbar, TabbarLink } from "../../navigation";
import { Block } from "../../others/Block";
import { IoEllipsisHorizontal, IoHome } from "react-icons/io5";
import { FaBook, FaEllipsisVertical, FaGear, FaMagnifyingGlass } from "react-icons/fa6";
import { FaSyncAlt } from "react-icons/fa";
import { Calendar, List } from "../../list";
import { Button } from "../../others";
import { useEffect } from "react";
import { useStates } from "../../../hooks";
import { useLocation } from "react-router-dom";

export const DevPage = () => {
    // mb-20 for tabbar and mb- for sidebar

    const list = [
        { to: "/", label: "Toutes", icon: <IoHome /> },
        { to: "/2", label: "A faire", icon: <FaBook /> },
        { to: "/3", label: "Annulées", icon: <FaSyncAlt /> },
        { to: "/4", label: "Refusées", icon: <FaGear /> }
    ];

    const { states, set } = useStates({
        init: false,
    });

    const { init } = states;

    const location = useLocation();

    return (
        <div id="main" className={`min-h-screen relative text-strong-text bg-soft mb-20`}>
            <Navbar 
                title={`Accueil`}
                left={[
                    { to: "Carnet", icon: <IoHome /> },
                ]}
                right={[
                    { to: "Accueil", icon: <FaMagnifyingGlass /> },
                    // { to: "Accueil", icon: <IoEllipsisHorizontal /> },
                ]}
                links={list}
            />
                
            {/* <List
                list={list}
                listItem={item => 
                    <div className={`p-4 row-between-center gap-4`}>
                        <div className={`row-v-center text-soft-text`}>
                            <div>
                                {item.icon}
                            </div>
                            <div>
                                {item.label}
                            </div>
                        </div>
                        <Button
                            left={<IoEllipsisHorizontal />}
                            className={`text-strong-text bg-soft`}
                        />
                    </div>
                }
                className={`divide-y divide-soft-border`}
            />  */}
            {/* <Calendar /> */}
                
            <Tabbar>
                <TabbarLink
                    label={`Accueil`}
                    to={`/`}
                    icon={<IoHome />}
                    // variant={"classic"}
                />
                <TabbarLink
                    label={`Carnet`}
                    to={`/2`}
                    icon={<FaBook />}
                />
                <TabbarLink
                    label={`Synchroniser`}
                    to={`/3`}
                    icon={<FaSyncAlt />}
                />
                <TabbarLink
                    label={`Paramètres`}
                    to={`/4`}
                    icon={<FaGear />}
                />
            </Tabbar>
            {/* <Sidebar>
                <SidebarLink
                    label={`Accueil`}
                    to={`/`}
                    icon={<IoHome />}
                />
                <SidebarLink
                    label={`Carnet`}
                    to={`/`}
                    icon={<FaBook />}
                />
                <SidebarLink
                    label={`Synchroniser`}
                    to={`/`}
                    icon={<FaSyncAlt />}
                />
                <SidebarLink
                    label={`Paramètres`}
                    to={`/`}
                    icon={<FaGear />}
                />
            </Sidebar> */}
        </div>
    );
};