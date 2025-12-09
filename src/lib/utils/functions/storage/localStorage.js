export function getLocal(key) {
    return JSON.parse(localStorage.getItem(key));
}

export function setLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocal(input) {
    localStorage.removeItem(input);
}

export const local = {
    get: (key) => JSON.parse(localStorage.getItem(key)),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    unset: (key) => localStorage.removeItem(key) 
};



// Anciennes functions

export function getLocalJSON(key) {
    return JSON.parse(getLocal(key));
}

export function setLocalJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}