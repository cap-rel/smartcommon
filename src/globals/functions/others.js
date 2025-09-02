import { isArray, isNil } from "./type";
  
  export const secondsToTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
  
    return `${m}:${`0${s}`.slice(-2)}`;
  };
  
  export const timestampToDate = (timestamp) => {
    if (isEmpty(timestamp)) {
      return;
    }
    const date = new Date(timestamp * 1000);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };
  
  export const timestampToDateTime = (timestamp) => {
    if (isEmpty(timestamp)) {
      return;
    }
    const date = new Date(timestamp * 1000);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    // const seconds = ("0" + date.getSeconds()).slice(-2);
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formattedDateTime;
  };
  
  export const dateToTimestamp = (date) => {
    const dateObject = new Date(date);
    return dateObject.getTime() / 1000;
  };
  
  export const compareDateToNow = (timestamp) => {
    const interval = timestamp - Date.now() / 1000;
    const days = interval / (60 * 60 * 24);
    return days;
  };

  export function cleanForComparison(value) {
    return value.toString().toUpperCase().replace(/\s+/g, "");
  } 
  
  export const searchBarFilter = (searchedValues, search) => {
    let isFiltered = false;

    const filter = (value) => {
      if (cleanForComparison(value).includes(cleanForComparison(search))) {
        isFiltered = true;
      }
    }

    if (isArray(searchedValues)) {
      searchedValues.forEach(value => filter(value))
    } else {
      filter(searchedValues);
    }

    return isFiltered;
  };
  
  export const unsetObject = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = "";
      }
    }
  };
  
  export const sortArrayByNumber = (array, prop, sort = "ascending") => {
    const compare = (a, b) => {
      const valA = prop ? a[prop] : a;
      const valB = prop ? b[prop] : b;
      return  sort === "ascending" ? valA - valB : valB - valA;
    };
  
    array.sort(compare);
    return array;
  };

  export const sortArrayByString = (array, prop, sort = "ascending") => {
    const compare = (a, b) => {
      const valA = (prop ? a[prop] : a)?.toLowerCase?.() ?? '';
      const valB = (prop ? b[prop] : b)?.toLowerCase?.() ?? '';
  
      return sort === "ascending"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    };
  
    return array.sort(compare);
  };
  
  export const isArrayOfObjects = (array) => {
    if (!Array.isArray(array)) {
        return false;
    }
  
    array.forEach(item => {
      if (typeof item !== 'object' || item === null) {
        return false;
      }
    })
  
    return true;
  }
  
  export const secsToTime = (secs) => {
    const decH = secs / 60 / 60;
    const h = ("0" + Math.floor(decH)).slice(-2);
    const m = ("0" + Math.floor(("0." + decH.toString().split(".")[1]) * 60)).slice(-2);
    return h != "00" ? h + " h " + m : m != "00" ? m + " min" : "moins d'une minute";
  }
  
  export const mToKm = (meters) => {
    const decKm = meters / 1000;
    const km = Math.floor(decKm);
    const m = Math.floor(("0." + decKm.toString().split(".")[1]) * 1000);
    return km ? km + "," + m.toString().substring(0, 1) + " km" : m + " m"; 
  }
  
  export function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
        e => resolve([e.coords.latitude, e.coords.longitude]),
        error => reject(error.message)
      );
      else reject("Impossible de Géolocaliser l'appareil.");
    });
  };
  
  export const hexToRgb = (hex) => {
    let cleanedHex = hex.replace('#', '');
  
    // If the hex code is in shorthand form (#123), expand it to full form (#112233)
    if (cleanedHex.length === 3) {
      cleanedHex = cleanedHex.split('').map(char => char + char).join('');
    }
  
    // Extract the red, green, and blue values
    const r = parseInt(cleanedHex.substring(0, 2), 16) || "?";
    const g = parseInt(cleanedHex.substring(2, 4), 16) || "?";
    const b = parseInt(cleanedHex.substring(4, 6), 16) || "?";
  
    // return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    return `${r}, ${g}, ${b}`;
  }
  
  export function secsToDuration(secs) {
    const seconds = secs % 60;
    const minutes = Math.floor((secs % 3600) / 60);
    const hours = Math.floor((secs % 86400) / 3600);
    const days = Math.floor(secs / 86400);
  
    return { seconds, minutes, hours, days };
  }
  
  export function generateRandomString(length, options) {
    const characterSets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      specials: '!@#$%^&*()-_=+[]{}|;:,.?/`~', // On ne met pas < et >
    };
  
    let characters = '';
    if (options.lowercase) characters += characterSets.lowercase;
    if (options.uppercase) characters += characterSets.uppercase;
    if (options.digits) characters += characterSets.digits;
    if (options.specials) characters += characterSets.specials;
  
    if (!characters) {
      throw new Error('Au moins une famille de caractères doit être sélectionnée.');
    }
  
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
  
    return randomString;
  }
  
  export function splitFileExtension(fileName) {
    const firstDotIndex = fileName.indexOf('.');
    if (firstDotIndex === -1) {
      return [fileName.replaceAll("_", " "), ""];
    }
    return [fileName.substring(0, firstDotIndex).replaceAll("_", " "), fileName.substring(firstDotIndex)];
  }
  
  export function isLast(array, index) {
    return array.length - 1 == index ? true : false;
  } 
  
  export function print(value) {
    const formatted = JSON.stringify(value, null, 2);
    document.write("<pre>" + formatted + "</pre>");
  }