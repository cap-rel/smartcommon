import Dexie from "dexie";
import { floor, forEach, keys } from "lodash";

import { log, throwTypeError } from "lib/utils";

// For multi-version Dexie schemas with .upgrade() callbacks, use the
// `Db` class directly (lib/utils/class/Db). This hook only exposes the
// single-version API.
export const useDb = ({ name, options = {}, version = 1, stores = {}, debug }) => {
    throwTypeError({ value: name, name: "Db name", type: ["string"], required: true });
    throwTypeError({ value: options, name: "Db options", type: ["plain object"] });
    throwTypeError({ value: version, name: "Db version", type: ["number"] });
    throwTypeError({ value: stores, name: "Db stores", type: ["plain object"] });

    const db = new Dexie(name, options);

    const logsIndexes = `
        id++,
        store,
        itemId,
        action,
        data,
        createdAt
    `;

    db.version(version).stores({ ...stores, logs: logsIndexes });

    forEach(keys(stores), (store) => {
        // db[store].hook('reading', (item) => {
        //     if (debug) {
        //         log.db("READ item =", item);
        //     }

        //     setTimeout(() => {
        //         db.logs.add({
        //             store,
        //             action: "read",
        //             data: structuredClone(item),
        //             createdAt: floor(Date.now() / 1000)
        //         });
        //     });

        //     return item;
        // });

        db[store].hook('creating', (key, item) => {
            if (debug) {
                log.db("CREATE key =", key, ", item =", item);
            }

            const dateNow = floor(Date.now() / 1000);

            item.createdAt = dateNow; 
            item.updatedAt = dateNow;

            setTimeout(() => {
                db.logs.add({
                    store,
                    itemId: key,
                    action: "create",
                    data: { ...item },
                    createdAt: dateNow
                });
            });
        });

        db[store].hook('updating', (updates, key, item) => {
            if (debug) {
                log.db("UPDATE key =", key, ", updates =", updates);
            }

            const dateNow = floor(Date.now() / 1000);

            item.updatedAt = dateNow;

            setTimeout(() => {
                db.logs.add({
                    store,
                    itemId: key,
                    action: "update",
                    data: { before: { ...item }, after: { ...item, ...updates } },
                    createdAt: dateNow
                });
            });

        });

        db[store].hook('deleting', (key, item) => {
            if (debug) {
                log.db("DELETE key =", key);
            }

            setTimeout(() => {
                db.logs.add({
                    store,
                    itemId: key,
                    action: "delete",
                    data: { ...item },
                    createdAt: floor(Date.now() / 1000)
                });
            });
        });
        
    });

    return db;
};