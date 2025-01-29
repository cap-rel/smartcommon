export function getLocal(input, parse = true) {
    const item = localStorage.getItem(input);
    return parse ? JSON.parse(item) : item;
}

export function getLocalJSON() {}
  
export function setLocal(input, value, stringify = true) {
    return localStorage.setItem(input, stringify ? JSON.stringify(value) : (value));
}

export function setLocalJSON() {}
  
export function removeLocal(input) {
    return localStorage.removeItem(input);
  }
  
export function getSession(input, parse = true) {
    const item = sessionStorage.getItem(input);
    return parse ? JSON.parse(item) : item;
}

export function getSessionJSON(input) {
    JSON.parse(sessionStorage.getItem(input));
}
  
export function setSession(input, value, stringify = true) {
    return sessionStorage.setItem(input, stringify ? JSON.stringify(value) : (value));
}

export function setSessionJSON(input, value) {
    return sessionStorage.setItem(input, JSON.stringify(value));
}
  
export function removeSession(input) {
    return sessionStorage.removeItem(input);
}
  
export function getDB(input, parse = true) {
    const item = indexedDB.getItem(input);
    return parse ? JSON.parse(item) : item;
}
  
export function setDB(input, value, stringify = true) {
    return indexedDB.setItem(input, stringify ? JSON.stringify(value) : (value));
}
  
export function removeDB(input) {
    return indexedDB.removeItem(input);
}