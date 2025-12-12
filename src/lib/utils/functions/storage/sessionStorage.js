export function getSession(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item !== null ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

export function setSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or unavailable
    }
}

export function removeSession(input) {
    sessionStorage.removeItem(input);
}

export const session = {
    get: (key) => getSession(key),
    set: (key, value) => setSession(key, value),
    unset: (key) => sessionStorage.removeItem(key)
};

// Deprecated - use getSession instead (already returns parsed JSON)
export function getSessionJSON(key) {
    return getSession(key);
}

// Deprecated - use setSession instead
export function setSessionJSON(key, value) {
    setSession(key, value);
}