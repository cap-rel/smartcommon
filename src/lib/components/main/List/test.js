    const test2 = () => {
        const request = window.indexedDB.open("MyTestDatabase", 3);

        request.onupgradeneeded = e => {
            const db = event.target.result;

            // readonly, readwrite, versionchange => trois modes de transactions
            const transaction = db.transaction(["customers"], "readwrite");

            transaction.oncomplete = e => { console.log("All done"); };
            transaction.onerror = e => { console.log("Error"); };

            const objectStore = transaction.objectStore("customers");

            customerData.forEach((customer) => {
                const request = objectStore.add(customer);
                request.onsuccess = e => {
                    // e.target.result === customer.id;
                };
            });
        };
    };

    const test3 = () => {
        const request = window.indexedDB.open("MyTestDatabase", 3);

        request.onupgradeneeded = e => {
            const db = event.target.result;

            const request = db
                .transaction(["customers"], "readwrite")
                .objectStore("customers")
                .delete(1);
        }
    };

    // get, put, delete, add

    // Utilisation de curseur pour récupérer les données sans distinctions ou getAll (voir aussi getAllKeys)

    // objectStore.index("name") On peut utiliser le curseur sur l'index aussi (voir aussi openKeyCursor)

    // Attention Contenu de fenêtre de tiers (par exemple, <iframe> content) ne peut pas accéder à IndexedDB si le navigateur est configuré pour ne jamais accepter les cookies de tiers (voir le bogue de Firefox 1147821 ).