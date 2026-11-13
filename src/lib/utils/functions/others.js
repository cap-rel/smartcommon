import { isArray } from "lodash";
import { createLogger } from "lib/utils/functions/consoleLogs";

const logger = createLogger("others");
  
  export const secondsToTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
  
    return `${m}:${`0${s}`.slice(-2)}`;
  };
  
  // Unix timestamp (seconds, number or numeric string) to a Date, or null
  // when there is none.
  const timestampToDateObject = (timestamp) => {
    if (timestamp === null || timestamp === undefined || timestamp === "") {
      return null;
    }
    const seconds = Number(timestamp);
    if (!Number.isFinite(seconds)) {
      logger.warning("not a timestamp", timestamp);
      return null;
    }
    return new Date(seconds * 1000);
  };

  export const timestampToDate = (timestamp) => {
    const date = timestampToDateObject(timestamp);
    if (!date) {
      return;
    }
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };
  
  export const timestampToDateTime = (timestamp) => {
    const date = timestampToDateObject(timestamp);
    if (!date) {
      return;
    }
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
      if (key in obj) {
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

  export const sortObjectByNumber = (object, prop, sort = "ascending") => {
    const sortedEntries = Object.entries(object).sort(([, a], [, b]) => {
      const valA = prop ? a[prop] : a;
      const valB = prop ? b[prop] : b;
      return sort === "ascending" ? valA - valB : valB - valA;
    });

    return Object.fromEntries(sortedEntries);
  }

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
  
    return array.every(item => typeof item === 'object' && item !== null);
  }
  
  export const secsToTime = (secs) => {
    const total = Math.max(0, Math.floor(Number(secs) || 0));
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    return h !== "00" ? h + " h " + m : m !== "00" ? m + " min" : "moins d'une minute";
  }
  
  export const mToKm = (meters) => {
    const total = Math.max(0, Math.floor(Number(meters) || 0));
    const km = Math.floor(total / 1000);
    const rest = total % 1000;
    // One decimal, truncated: 2000 -> "2,0 km", 1580 -> "1,5 km".
    return km ? km + "," + Math.floor(rest / 100) + " km" : rest + " m";
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
    // 0 is a valid channel ("#000"): only an unparsable one becomes "?".
    const channel = (part) => {
      const value = parseInt(part, 16);
      return Number.isNaN(value) ? "?" : value;
    };
    const r = channel(cleanedHex.substring(0, 2));
    const g = channel(cleanedHex.substring(2, 4));
    const b = channel(cleanedHex.substring(4, 6));
  
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
  
  export function print(value) {
    const formatted = JSON.stringify(value, null, 2);
    document.write("<pre>" + formatted + "</pre>");
  }

  export function toFirstUppercase(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

export function mergeObj(obj1, obj2) {
  const mergedObj = { ...obj1 };
  for (const key in obj2) {
    // if (obj2[key] && typeof obj2[key] === 'object' && !isArray(obj2[key])) {
    //   result[key] = deepMerge(result[key] || {}, obj2[key]);
    // }
    if (key in mergedObj) {
      mergedObj[key] = { ...mergedObj[key], ...obj2[key] };
    } else {
      mergedObj[key] = obj2[key];
    }
  }
  return mergedObj;
};

export const locate = (success = () => {}, error = () => {}) => {
    navigator.geolocation.getCurrentPosition(
        position => {
          const coords = [position.coords.latitude, position.coords.longitude];
          logger.info(`Geolocation success`, coords);
          // The raw position goes second so callers that only want
          // [lat, lng] keep working, while others can read accuracy,
          // altitude or timestamp.
          success(coords, position);
        },
        err => {
          logger.error(`Geolocation error`, err);
          error(err);
        }
    )
}