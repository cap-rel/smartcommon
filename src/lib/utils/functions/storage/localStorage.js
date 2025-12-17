import { isNull } from "lodash";

export function getLocal(key) {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

export function setLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or unavailable
    }
}

export function removeLocal(input) {
    localStorage.removeItem(input);
}

export const local = {
    get: (key) =>  {
        const item = localStorage.getItem(key);
        return !isNull(item) ? JSON.parse(item) : null;
    },
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    unset: (key) => localStorage.removeItem(key)
};

// Deprecated - use getLocal instead (already returns parsed JSON)
export function getLocalJSON(key) {
    return getLocal(key);
}

// Deprecated - use setLocal instead
export function setLocalJSON(key, value) {
    setLocal(key, value);
}