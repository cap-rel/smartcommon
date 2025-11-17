export function getLocal(key) {
    return JSON.parse(localStorage.getItem(key));
}

export function setLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocal(input) {
    localStorage.removeItem(input);
}




// Anciennes functions

export function getLocalJSON(key) {
    return JSON.parse(getLocal(key));
}

export function setLocalJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}