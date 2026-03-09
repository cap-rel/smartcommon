import Dexie from "dexie";
import { floor, forEach, keys, isEqual, get, set } from "lodash";

import { log, throwTypeError } from "lib/utils";

const LOGS_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export class Db {
    db;
    name;
    debug;

    constructor({ name, options = {}, version = 1, stores = {}, debug } = {}) {
        throwTypeError({ value: name, name: "Db name", type: ["string"], required: true });
        throwTypeError({ value: options, name: "Db options", type: ["plain object"] });
        throwTypeError({ value: version, name: "Db version", type: ["number"] });
        throwTypeError({ value: stores, name: "Db stores", type: ["plain object"] });

        this.name = name;
        this.debug = debug ?? (typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV));

        this.db = new Dexie(name, options);

        this._initStores(version, stores);
        this._initHooks(stores);

        if (debug) {
            this._purgeLogs();
        }
    }

    _initStores(version, stores) {
        const logsIndexes = `
            id++,
            store,
            itemId,
            action,
            createdAt
        `;

        this.db.version(version).stores({ ...stores, logs: logsIndexes });
    }

    _purgeLogs() {
        const cutoff = floor(Date.now() / 1000) - LOGS_MAX_AGE_SECONDS;

        this.db.logs
            .where("createdAt")
            .below(cutoff)
            .delete()
            .catch((err) => log.db("Failed to purge old logs:", err));
    }

    _initHooks(stores) {
        const { db, debug } = this;

        forEach(keys(stores), (store) => {
            db[store].hook("creating", (key, item) => {
                if (debug) {
                    log.db(`CREATE in ${store} - key =`, key, ", item =", item);
                }

                const dateNow = floor(Date.now() / 1000);

                item.createdAt = dateNow;
                item.updatedAt = dateNow;

                if (debug) {
                    setTimeout(() => {
                        db.logs.add({
                            store,
                            itemId: key,
                            action: "create",
                            createdAt: dateNow
                        }).catch((err) => log.db("Failed to log create:", err));
                    });
                }
            });

            db[store].hook("updating", (updates, key, item) => {
                const filteredUpdates = {};

                forEach(updates, (value, key) => {
                    if (!isEqual(updates[key], get(item, key))) {
                        set(filteredUpdates, key, value);
                    }
                });

                if (debug) {
                    log.db(`UPDATE in ${store} - key =`, key, ", updates =", filteredUpdates);
                }

                const dateNow = floor(Date.now() / 1000);

                item.updatedAt = dateNow;

                if (debug) {
                    setTimeout(() => {
                        db.logs.add({
                            store,
                            itemId: key,
                            action: "update",
                            data: {
                                updates: { ...updates },
                                filteredUpdates
                            },
                            createdAt: dateNow
                        }).catch((err) => log.db("Failed to log update:", err));
                    });
                }
            });

            db[store].hook("deleting", (key, item) => {
                if (debug) {
                    log.db(`DELETE in ${store} - key =`, key);
                }

                if (debug) {
                    setTimeout(() => {
                        db.logs.add({
                            store,
                            itemId: key,
                            action: "delete",
                            createdAt: floor(Date.now() / 1000)
                        }).catch((err) => log.db("Failed to log delete:", err));
                    });
                }
            });
        });
    }

    /** Direct access to Dexie if needed */
    get instance() {
        return this.db;
    }
}
