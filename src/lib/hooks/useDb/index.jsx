import Dexie from "dexie";

export const useDb = (name, options) => {
    return new Dexie(name, options);
};