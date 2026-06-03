import Dexie from "dexie";
import { floor, forEach, keys, isEqual, get, set, isPlainObject, isArray, isFunction } from "lodash";

import { log, throwTypeError } from "lib/utils";

const LOGS_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// FROZEN: do not modify this string.
//
// The `logs` store is appended to EVERY user-defined schema version.
// Modifying its indexes would change the schema hash that Dexie computes,
// and every consumer with an existing IndexedDB would hit a VersionError
// on their next open, without us being able to coordinate a version bump
// on their side. If you genuinely need to extend the logs schema, the
// only safe path is a major version bump of the smartcommon library plus
// a coordinated bump of every consumer's user-facing version with a
// no-op .upgrade() registered for the logs store. There is a snapshot
// test (`Db/index.test.js`, "LOGS_INDEXES is frozen") that will fail if
// this string is ever changed, to force the conversation.
export const LOGS_INDEXES = `
    id++,
    store,
    itemId,
    action,
    createdAt
`;

export class Db {
    db;
    name;
    debug;

    constructor({
        name,
        options = {},
        version = 1,
        stores = {},
        versions,
        debug,
    } = {}) {
        throwTypeError({ value: name, name: "Db name", type: ["string"], required: true });
        throwTypeError({ value: options, name: "Db options", type: ["plain object"] });

        // Discriminator is ONLY `versions !== undefined`. We keep the
        // legacy `version = 1, stores = {}` defaults so that
        // `new Db({ name: "foo" })` still creates a logs-only DB, exactly
        // like the previous release.
        //
        // If the caller passes BOTH `versions` and (`version` or `stores`)
        // we can't reliably distinguish explicit from default values, so
        // we just warn and let `versions` win. See decision E in todo.md.
        const useMulti = versions !== undefined;

        if (useMulti && (version !== 1 || keys(stores).length > 0)) {
            log.warning(
                "Db: 'version' / 'stores' are ignored when 'versions' is provided",
            );
        }

        const normalized = useMulti
            ? this._validateVersions(versions)
            : this._validateSingle(version, stores);

        this.name = name;
        this.debug = debug ?? (typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV));

        this.db = new Dexie(name, options);

        this._initStores(normalized);
        this._initHooks(normalized[normalized.length - 1].stores);

        if (debug) {
            this._purgeLogs();
        }
    }

    _validateSingle(version, stores) {
        throwTypeError({ value: version, name: "Db version", type: ["number"] });
        throwTypeError({ value: stores, name: "Db stores", type: ["plain object"] });
        if (!(version > 0)) {
            throw new Error(`Db: version must be > 0, got ${version}.`);
        }
        return [{ version, stores }];
    }

    _validateVersions(versions) {
        if (!isArray(versions)) {
            throw new Error("Db: versions must be an array.");
        }
        if (versions.length === 0) {
            throw new Error("Db: versions array cannot be empty.");
        }
        let lastSeen = 0;
        versions.forEach((entry, idx) => {
            if (!isPlainObject(entry)) {
                throw new Error(`Db: versions[${idx}] must be a plain object.`);
            }
            const { version, stores, upgrade } = entry;
            if (typeof version !== "number" || !(version > 0)) {
                throw new Error(`Db: versions[${idx}].version must be a number > 0.`);
            }
            if (version <= lastSeen) {
                throw new Error(
                    `Db: versions must be strictly increasing, `
                    + `versions[${idx}].version (${version}) <= previous (${lastSeen}).`,
                );
            }
            lastSeen = version;
            if (!isPlainObject(stores)) {
                throw new Error(`Db: versions[${idx}].stores must be a plain object.`);
            }
            if (keys(stores).length === 0) {
                throw new Error(`Db: versions[${idx}].stores cannot be empty.`);
            }
            if (upgrade !== undefined && !isFunction(upgrade)) {
                throw new Error(`Db: versions[${idx}].upgrade, if present, must be a function.`);
            }
        });
        return versions;
    }

    _initStores(entries) {
        // Apply each version (and its optional upgrade callback) in order.
        // The `logs` store is appended to every entry so it lives alongside
        // the user-defined schema. LOGS_INDEXES is FROZEN (see comment on
        // the constant declaration); modifying it would force every
        // consumer to bump their own user-facing version, which is not
        // something this library can coordinate.
        forEach(entries, (entry) => {
            const schema = { ...entry.stores, logs: LOGS_INDEXES };
            const chain = this.db.version(entry.version).stores(schema);
            if (typeof entry.upgrade === "function") {
                chain.upgrade(entry.upgrade);
            }
        });
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
            // A store declared as null in this (latest) version was dropped:
            // Dexie deletes the table on upgrade, so db[store] is undefined and
            // there is no table to attach creating/updating/deleting hooks to.
            // Skipping it lets consumers retire a store via `{ store: null }`
            // (the canonical Dexie idiom) without crashing at construction.
            if (stores[store] === null || !db[store]) {
                return;
            }

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
