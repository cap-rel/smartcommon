export function getSession(key) {
    return JSON.parse(sessionStorage.getItem(key));
}
  
export function setSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}
  
export function removeSession(input) {
    sessionStorage.removeItem(input);
}

export const session = {
    get: (key) => JSON.parse(sessionStorage.getItem(key)),
    set: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
    unset: (key) => sessionStorage.removeItem(key) 
};

// Anciennes fonctions

export function getSessionJSON(key) {
    return JSON.parse(getSession(key));
}

export function setSessionJSON(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}