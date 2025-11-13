
    // const DB_NAME = 'smartinterventions';
    // const DB_VERSION = 1;
    
    // const config = {
    //     users: {
    //         id: {},
    //         user: {},
    //         entity: {},
    //         accessToken: {},
    //         refreshToken: {},
    //         tokenType: {},
    //         expiresIn: {},
    //         rememberMe: {},
    //         tokenExpiry: {},
    //     },
    //     interventions: {
    //         id: {},
    //         userId: {},
    //         label: {},
    //         description: {},
    //         startDate: {},
    //         startEnd: {},
    //         duration: {},
    //         photos: {},
    //         lines: {},
    //     },
    //     settings: {
    //         id: {}, // auto-increment
    //         userId: {},
    //         darkMode: {},
    //         lng: {},
    //         scale: {},
    //         theme: {},
    //     }
    // };

    // const userData = [
    //     { id: 2, user: "paolo", entity: 1, accessToken: "token", refreshToken: "token", tokenType: "bearer", expiresIn: 1111111111, rememberMe: false, tokenExpiry: null },
    //     { id: 4, user: "eric", entity: 1, accessToken: "token", refreshToken: "token", tokenType: "bearer", expiresIn: 1111111111, rememberMe: false, tokenExpiry: null },
    // ];

    // const initDB = () => {
    //     const req = indexedDB.open(DB_NAME, DB_VERSION);

    //     req.onerror = e => { console.log("Error"); };
    //     req.onsuccess = e => { console.log("Success"); };

    //     req.onupgradeneeded = e => { // currentTarget ?
    //         const db = e.target.result;

    //         for (const objName in config) {
    //             const objSchema = config[objName];

    //             const options = objName === "settings" ? { keyPath: "id", autoIncrement: true } : { keyPath: "id" };

    //             const objectStore = db.createObjectStore(objName, options);

    //             for (const field in objSchema) {
    //                 objectStore.createIndex(field, field, { unique: field === "id" })
    //             }
    //         }
    //     };
    // };

    // // useEffect(() => {
    // //     initDB();
    // // }, [])

    // const createData = () => {
    //     const req = indexedDB.open(DB_NAME, DB_VERSION);

    //     req.onerror = e => { console.log("Login error"); };
    //     req.onsuccess = e => { 
    //         console.log("Login success");

    //         const db = req.result;

    //         const objectStore = db.transaction(["users"], "readwrite").objectStore("users");

    //         userData.forEach(user => {
    //             const req = objectStore.add(user);
    //             req.onsuccess = e => {
    //                 console.log("Creation success");
    //                 // event.target.result === customer.ssn;
    //             };
    //             req.onerror = e => {
    //                 console.log("Creation error");
    //             }
    //         });
    //     };
    // };

    // const test1 = () => {
    //     const request = indexedDB.open("MyTestDatabase", 3);

    //     request.onerror = e => { console.log("Error"); };
    //     request.onsuccess = e => { console.log("Success"); };

    //     request.onupgradeneeded = e => {
    //         // Save the IDBDatabase interface
    //         const db = e.target.result;

    //         // Create an objectStore for this database
    //         const objectStore = db.createObjectStore("interventions", { keyPath: "id" }); // { autoIncrement: true } instead of { keyPath }

    //         objectStore.createIndex("name", "name", { unique: false });
    //         objectStore.createIndex("email", "email", { unique: true }); // unique like in SQL

    //         // Use transaction oncomplete to make sure the objectStore creation is
    //         // finished before adding data into it.
    //         objectStore.transaction.oncomplete = (event) => {
    //             // Store values in the newly created objectStore.
    //             const customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");

    //             customerData.forEach((customer) => {
    //                 customerObjectStore.add(customer);
    //             });
    //         };
    //     };
    // };
