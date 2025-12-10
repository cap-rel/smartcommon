import Dexie from "dexie";
import { floor, forEach, keys } from "lodash";

import { log, throwTypeError } from "lib/utils";

export const useDb = ({ name, options, version = 1, stores = {}, debug = false }) => {
    throwTypeError({ value: name, name: "Db name", type: ["string"], required: true });
    throwTypeError({ value: options, name: "Db options", type: ["plain object"] });
    throwTypeError({ value: name, name: "Db version", type: ["number"] });
    throwTypeError({ value: name, name: "Db stores", type: ["string"] });

    const db = new Dexie(name, options);

    const logsIndexes = `
        id++,
        store,
        itemId,
        action,
        data,
        createdAt,
    `;

    db.version(version).stores({ ...stores, logs: logsIndexes });

    forEach(keys(stores), (store) => {
        db[store].hook('reading', (item) => {
            if (debug) {
                log.db("READ item =", item);
            }

            db.logs.add({
                store,
                action: "read",
                data: structuredClone(item),
                createdAt: floor(Date.now() / 1000)
            });

            return item;
        });

        db[store].hook('creating', (key, item) => {
            if (debug) {
                log.db("CREATE key =", key, ", item =", item);
            }

            const dateNow = floor(Date.now() / 1000);

            db.logs.add({
                store,
                itemId: key,
                action: "create",
                data: structuredClone(item),
                createdAt: dateNow
            });

            item.createdAt = dateNow; 
            item.updatedAt = dateNow;
        });

        db[store].hook('updating', (updates, key, item) => {
            if (debug) {
                log.db("UPDATE key =", key, ", updates =", updates);
            }

            const dateNow = floor(Date.now() / 1000);

            db.logs.add({
                store,
                itemId: key,
                action: "update",
                data: structuredClone({ before: item, after: { ...item, ...updates } }),
                createdAt: dateNow
            });

            item.updatedAt = dateNow;
        });

        db[store].hook('deleting', (key, item) => {
            if (debug) {
                log.db("DELETE key =", key);
            }

            db.logs.add({
                store,
                itemId: key,
                action: "delete",
                data: structuredClone(item),
                createdAt: floor(Date.now() / 1000)
            });
        });
        
    });

    return db;
};