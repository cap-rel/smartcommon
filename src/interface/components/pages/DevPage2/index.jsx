import { Link, useLocation } from "react-router-dom";
import { Block, List, ListItem, LowerNavbarItem, Navbar, Page, Panel, Tabbar, TabbarItem } from "../../../../lib";
import { useEffect, useState } from "react";
import { FaUserAstronaut, FaUser, FaGear, FaGears } from "react-icons/fa6";

export const DevPage2 = () => {
    const location = useLocation();

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const DB_NAME = 'smartinterventions';
    const DB_VERSION = 1;
    
    const config = {
        users: {
            id: {},
            user: {},
            entity: {},
            accessToken: {},
            refreshToken: {},
            tokenType: {},
            expiresIn: {},
            rememberMe: {},
            tokenExpiry: {},
        },
        interventions: {
            id: {},
            userId: {},
            label: {},
            description: {},
            startDate: {},
            startEnd: {},
            duration: {},
            photos: {},
            lines: {},
        },
        settings: {
            id: {}, // auto-increment
            userId: {},
            darkMode: {},
            lng: {},
            scale: {},
            theme: {},
        }
    };

    const userData = [
        { id: 2, user: "paolo", entity: 1, accessToken: "token", refreshToken: "token", tokenType: "bearer", expiresIn: 1111111111, rememberMe: false, tokenExpiry: null },
        { id: 4, user: "eric", entity: 1, accessToken: "token", refreshToken: "token", tokenType: "bearer", expiresIn: 1111111111, rememberMe: false, tokenExpiry: null },
    ];

    const initDB = () => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onerror = e => { console.log("Error"); };
        req.onsuccess = e => { console.log("Success"); };

        req.onupgradeneeded = e => { // currentTarget ?
            const db = e.target.result;

            for (const objName in config) {
                const objSchema = config[objName];

                const options = objName === "settings" ? { keyPath: "id", autoIncrement: true } : { keyPath: "id" };

                const objectStore = db.createObjectStore(objName, options);

                for (const field in objSchema) {
                    objectStore.createIndex(field, field, { unique: field === "id" })
                }
            }
        };
    };

    useEffect(() => {
        initDB();
    }, [])

    const createData = () => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onerror = e => { console.log("Login error"); };
        req.onsuccess = e => { 
            console.log("Login success");

            const db = req.result;

            const objectStore = db.transaction(["users"], "readwrite").objectStore("users");

            userData.forEach(user => {
                const req = objectStore.add(user);
                req.onsuccess = e => {
                    console.log("Creation success");
                    // event.target.result === customer.ssn;
                };
                req.onerror = e => {
                    console.log("Creation error");
                }
            });
        };
    };

    const test1 = () => {
        const request = indexedDB.open("MyTestDatabase", 3);

        request.onerror = e => { console.log("Error"); };
        request.onsuccess = e => { console.log("Success"); };

        request.onupgradeneeded = e => {
            // Save the IDBDatabase interface
            const db = e.target.result;

            // Create an objectStore for this database
            const objectStore = db.createObjectStore("interventions", { keyPath: "id" }); // { autoIncrement: true } instead of { keyPath }

            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("email", "email", { unique: true }); // unique like in SQL

            // Use transaction oncomplete to make sure the objectStore creation is
            // finished before adding data into it.
            objectStore.transaction.oncomplete = (event) => {
                // Store values in the newly created objectStore.
                const customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");

                customerData.forEach((customer) => {
                    customerObjectStore.add(customer);
                });
            };
        };
    };

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
                    titleProps={{
                        onClick: () => createData()
                    }}
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