import { Link, useLocation } from "react-router-dom";
import { Block, Button, List, ListItem, LowerNavbarItem, Navbar, Page, Panel, PhotosUploader, Popup, Tabbar, TabbarItem } from "../../../../lib";
import { useEffect, useState } from "react";
import { FaUserAstronaut, FaUser, FaGear, FaGears } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../../../lib/hooks/useDb/tests/reducers/slices/usersSlice";

export const DevPage2 = () => {
    const location = useLocation();

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const [photos, setPhotos] = useState([]);

    const dispatch = useDispatch();

    const handleClick = () => {
        console.log("test");
        const data = {
            id: 1,
            user: "paolo",
            entity: 1,
            accessToken: "token",
            refreshToken: "token",
            tokenType: "bearer",
            expiresIn: 13131314,
            rememberMe: false,
            tokenExpiry: 121211414,
        };

        dispatch(addUser(data));
    };

    const users = useSelector(state => state.users.data);

    useEffect(() => {
        console.log(users);
    }, [users]);
    
    return (
        <>
            <Page pageProps={{ id: "Principal" }}>
                <Popup
                    isOpen={isPanelOpen}
                    close={() => setIsPanelOpen(false)}
                >
                    <div className="h-100">

                    </div>
                </Popup>
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
                    titleProps={{
                        onClick: () => setIsPanelOpen(true)
                    }}
                />
                <PhotosUploader 
                    value={photos}
                    onChange={value => setPhotos(value)}
                />
                <Button
                    label={"add user"}
                    onClick={handleClick}
                />
                <List
                    title="Liste des interventions"
                    sortProps={"bojuour"}
                >
                    <ListItem title="bonjour"/>
                </List>
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
                    <PhotosUploader 
                        value={photos}
                        onChange={value => setPhotos(value)}
                    />
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