export function getLocal(key) {
    return localStorage.getItem(key);
}

export function getLocalJSON(key) {
    return JSON.parse(getLocal(key));
}
  
export function setLocal(key, value) {
    return localStorage.setItem(key, value);
}

export function setLocalJSON(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
}
  
export function removeLocal(input) {
    return localStorage.removeItem(input);
}
  
export function getSession(key) {
    return sessionStorage.getItem(key);
}

export function getSessionJSON(key) {
    return JSON.parse(getSession(key));
}
  
export function setSession(key, value) {
    return sessionStorage.setItem(key, value);
}

export function setSessionJSON(key, value) {
    return sessionStorage.setItem(key, JSON.stringify(value));
}
  
export function removeSession(input) {
    return sessionStorage.removeItem(input);
}
  
export function getIndexedDB(key) {
    return indexedDB.getItem(key);
}

export function getIndexedDBJSON(key) {
    return JSON.parse(getIndexedDB(key));
}
  
export function setIndexedDB(key, value) {
    return indexedDB.setItem(key, value);
}
s
export function setIndexedDBJSON(key, value) {
    return indexedDB.setItem(key, JSON.stringify(value));
}
  
export function removeIndexedDB(input) {
    return indexedDB.removeItem(input);
}