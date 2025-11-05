import { Link, useLocation } from "react-router-dom";
import { Page, Panel, Tabbar, TabbarItem } from "../../../../lib";
import { useState } from "react";
import { FaUserAstronaut, FaUser, FaGear, FaGears } from "react-icons/fa6";

export const DevPage2 = () => {
    const location = useLocation();

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <>
            <Page pageProps={{ id: "Principal", className: "mb-(--test-tabbar-height) lg:mb-0 lg:ml-(--test-tabbar-width)" }}>
                <div className="flex flex-col">
                    <Link to={"/"}>Bonjour</Link>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>

                    <Panel
                        position="bottom"
                        isOpen={isPanelOpen}
                        close={() => setIsPanelOpen(false)}
                    >
                        <div className="min-w-50 min-h-100">

                        </div>
                    </Panel>
                    <div className="h-[2000px]">
                        sfdsqfq
                    </div>
                </div>
            </Page>
            <Tabbar id={"test"}>
                <TabbarItem
                    icon={FaUser}
                    activeIcon={FaUserAstronaut}
                    active={location.pathname === "/dev2"}
                    label="Utilisateur"
                />
                <TabbarItem
                    icon={FaGear}
                    activeIcon={FaGears}
                    active={location.pathname === "/"}
                    label="Paramètres"
                />
            </Tabbar>
        </>
    );
};