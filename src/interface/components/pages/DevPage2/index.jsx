import { Link, useLocation } from "react-router-dom";
import { Block, List, LowerNavbarItem, Navbar, Page, Panel, Tabbar, TabbarItem } from "../../../../lib";
import { useState } from "react";
import { FaUserAstronaut, FaUser, FaGear, FaGears } from "react-icons/fa6";

export const DevPage2 = () => {
    const location = useLocation();

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <>
            <Page pageProps={{ id: "Principal" }}>
                <Navbar
                    id="navbar"
                    title="Navbar"
                    bottom={<>
                        <LowerNavbarItem
                            label={"Toutes"}
                            active
                        />
                        <LowerNavbarItem
                            label={"Mes interventions"}
                        />
                        <LowerNavbarItem
                            label={"Urgentes"}
                        />
                        <LowerNavbarItem
                            label={"Non assignées"}
                        />
                    </>}
                />
                <List />
                <Block title={"Interventions à faire"}>
                    <Link to={"/"}>
                        Bonjour
                    </Link>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>

                </Block>
                <Block title={"Interventions urgentes"}>
                    <Link to={"/"}>
                        Bonjour
                    </Link>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>

                </Block>
                <Block title={"bonjour"}>
                    <Link to={"/"}>
                        Bonjour
                    </Link>
                    <button onClick={() => setIsPanelOpen(true)}>Open</button>
                </Block>

                {/* <Panel
                    position="bottom"
                    isOpen={isPanelOpen}
                    close={() => setIsPanelOpen(false)}
                >
                    <div className="min-w-50 min-h-100">

                    </div>
                </Panel>
                <div className="h-[2000px] flex flex-col justify-end">
                    Fin de page
                </div> */}
                <Tabbar id={"tabbar"}>
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
            </Page>
        </>
    );
};