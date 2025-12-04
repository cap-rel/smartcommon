import { useState } from "react";
import { isNil, isPlainObject } from "lodash";
import { log } from "lib/utils";

export const useStates = ({ initialStates = {}, debug = false }) => {
  if (!isPlainObject(initialStates)) {
    throw new Error("initialStates must be a plain object.");
  }

  const [states, setStates] = useState(initialStates);

  // ---------------------- parsePath (Parser) ----------------------
  const parsePath = (path) => {
    const parts = [];
    path.split(".").forEach(segment => {
      const regex = /([\w-]+)|\[(\d*)\]/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        if (match[1]) parts.push(match[1]);
        else if (match[2] === "") parts.push("__PUSH__"); // push automatique
        else parts.push(match[2]); // index numérique
      }
    });
    return parts;
  };

  // ---------------------- set ----------------------
  const set = (path, value) => {
    setStates(prev => {
      const newState = structuredClone(prev);
      const parts = parsePath(path);

      let level = newState;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const nextKey = parts[i + 1];
        const isNextPush = nextKey === "__PUSH__";

        // Remplace un scalaire par un objet ou tableau si nécessaire
        if (level[key] !== Object(level[key])) {
          level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
        }

        // Crée le niveau si absent
        if (!(key in level)) {
          level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
        }

        level = level[key];
      }

      const lastKey = parts[parts.length - 1];

      // Applique la valeur (fonction ou simple valeur)
      const applyValue = (target, keyOrIndex) => {
        const prevValue =
          keyOrIndex === "__PUSH__"
            ? target[target.length - 1]
            : target[keyOrIndex];
        const newValue = typeof value === "function" ? value(prevValue) : value;

        if (keyOrIndex === "__PUSH__") {
          target.push(newValue);
        } else {
          target[keyOrIndex] = newValue;
        }
      };

      if (lastKey === "__PUSH__") {
        if (!Array.isArray(level)) {
          level = level instanceof Object ? level : [];
        }
        applyValue(level, "__PUSH__");
      } else {
        applyValue(level, lastKey);
      }

      if (debug) {
        log.state(`SET ${path} =>`, value);
      }

      return newState;
    });
  };

  // ---------------------- get ----------------------
  const get = (path) => {
    let level = states;
    
    if (!isNil(path)) {
      const parts = parsePath(path);

      for (const part of parts) {
        if (part === "__PUSH__") return undefined; // get([]) n’a pas de sens
        if (level == null) return undefined;
        if (!(part in level)) return undefined;
        level = level[part];
      }
    }

    return level;
  };

  // ---------------------- unset ----------------------
  const unset = (path) => {
    setStates(prev => {
      if (isNil(path)) {
        if (debug) {
          log.state("UNSET");
        }

        return {};  
      }

      const newState = structuredClone(prev);
      let level = newState;
      
      const parts = parsePath(path);
      const last = parts.pop();
      
      for (const part of parts) {
        // impossible d’unset[] → ignore
        if (part === "__PUSH__") {
          return newState;
        }

        // chemin inexistant
        if (!(part in level)) {
          return newState;
        }

        level = level[part];
        if (level == null) {
          return newState;
        }
      }

      if (Array.isArray(level) && /^\d+$/.test(last)) {
        const index = Number(last);
        if (index >= 0 && index < level.length) {
          level.splice(index, 1);
          
          if (debug) {
            log.state(`UNSET ${path}`);
          }
        }
      } else {
        if (last in level) {
          delete level[last];

          if (debug) {
            log.state(`UNSET ${path}`);
          }
        }
      }

      return newState;
    });
  };

  return { states, set, get, unset };
};
