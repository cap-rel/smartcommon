import { useMemo } from "react";
import Dexie from "dexie";
import { floor, forEach, keys } from "lodash";

import { log, throwTypeError } from "lib/utils";

// For multi-version Dexie schemas with .upgrade() callbacks, use the
// `Db` class directly (lib/utils/class/Db). This hook only exposes the
// single-version API.
//
// The Dexie instance is memoized on the schema signature (name + version +
// stores). WITHOUT this memo the hook returned a NEW Dexie instance on every
// render: `db` then had a fresh identity each time, which invalidated every
// consumer `useEffect([db, ...])` and could spin an infinite async render loop
// (a db-dependent effect that setStates re-renders -> new db -> effect re-runs),
// pegging the CPU. It also leaked a new IndexedDB connection per render.
// `options` is intentionally excluded from the signature: it is effectively
// static per call site (and may hold non-serializable Dexie addons), so keying
// on the schema identity is enough.
export const useDb = ({ name, options = {}, version = 1, stores = {}, debug }) => {
    throwTypeError({ value: name, name: "Db name", type: ["string"], required: true });
    throwTypeError({ value: options, name: "Db options", type: ["plain object"] });
    throwTypeError({ value: version, name: "Db version", type: ["number"] });
    throwTypeError({ value: stores, name: "Db stores", type: ["plain object"] });

    // Schema signature. `stores`/`options` are deliberately kept out of the
    // dependency array (identity churns every render); the JSON key captures the
    // only part that must trigger a rebuild.
    const storesKey = JSON.stringify(stores);

    return useMemo(() => buildDb({ name, options, version, stores, debug }), [name, version, storesKey, debug]);
};

const buildDb = ({ name, options, version, stores, debug }) => {
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