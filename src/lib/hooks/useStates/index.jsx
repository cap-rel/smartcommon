/*
 * useStates/index.jsx
 *
 * Copyright (c) 2024 Paolo Debaisieux <paolo.debaisieux@cap-rel.fr>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState } from "react";
import { isPlainObject } from "lodash";

// TODO Fixer le bug quand deux même string se suivent (ex: "test.test")

export const useStates = (initialStates = {}) => {
  if (!isPlainObject(initialStates)) {
    throw new Error("initialStates must be a plain object.");
  }

  const [states, setStates] = useState(initialStates);

  // let match = keys[i].match(/(\w+)\[(\d+)\]$/);
  // if (match) {
  //   level = level[match[1]][match[2]];
  // } else {
  //   level = level[keys[i]];
  // }
  // level[keys[keys.length - 1]] = state;

  // const set = (path, state) => {
  //   setStates(prevState => {
  //     const newState = { ...prevState };
  //     const keys = path.split(".");
  //     let level = newState;
  //     // const regex = /(\w+)|\[(\d+)\]/g;
  //     const regex = /([\w-]+)|\[(\d+)\]/g;      

  //     keys.forEach((key) => {
  //       let tab = [];
  //       let match;

  //       while ((match = regex.exec(key)) !== null) {
  //         if (match[1]) {
  //           tab = [...tab, match[1]];
  //         }
  //         if (match[2]) {
  //           tab = [...tab, match[2]];
  //         }
  //       }

  //       tab = tab.length > 1 ? tab : null;

  //       if (key != keys[keys.length - 1]) {
  //         if (tab) {
  //           level[tab[0]] = [...level[tab[0]]];
  //           level = level[tab[0]];
  //           for (let i = 1; i < tab.length; i++) {
  //             if (i != tab.length - 1) {
  //               level[tab[i]] = [...level[tab[i]]];
  //             }else{
  //               level[tab[i]] = { ...level[tab[i]] };
  //             }
  //             level = level[tab[i]];
  //           }
  //         } else {
  //           level[key] = { ...level[key] };
  //           level = level[key];
  //         }
  //       } else {
  //         if (tab) {
  //           level[tab[0]] = [...level[tab[0]]];
  //           level = level[tab[0]];
  //           for (let i = 1; i < tab.length; i++) {
  //             if (i != tab.length - 1) {
  //               level[tab[i]] = [...level[tab[i]]];
  //               level = level[tab[i]];
  //             } else {
  //               level[tab[i]] = state;
  //             }
  //           }
  //         } else {
  //           level[key] = state;
  //         }
  //       }
  //     });
  //     return newState;
  //   });
  // };

// const unset = (path) => {
//   setStates(prev => {
//     const newState = structuredClone(prev);

//     const keys = path
//       .replace(/\[(\d+)\]/g, ".$1") // items[2] → items.2
//       .split(".")
//       .filter(Boolean);

//     let level = newState;

//     for (let i = 0; i < keys.length - 1; i++) {
//       const key = keys[i];

//       if (!(key in level) || level[key] == null) {
//         // le chemin n'existe pas → rien à faire
//         return newState;
//       }

//       level = level[key];
//     }

//     const lastKey = keys[keys.length - 1];

//     // si c'est un index de tableau
//     if (Array.isArray(level) && /^\d+$/.test(lastKey)) {
//       const index = Number(lastKey);
//       if (index >= 0 && index < level.length) {
//         level.splice(index, 1);
//       }
//     } else {
//       // sinon suppression d'une clé d'objet
//       delete level[lastKey];
//     }

//     return newState;
//   });
// };

// const set = (path, value) => {
//   setStates(prev => {
//     const newState = structuredClone(prev);

//     // extraction propre des parties du path
//     // "a[1].b[2].c" → ["a", "1", "b", "2", "c"]
//     const parts = [];
//     path.split(".").forEach(segment => {
//       const regex = /([\w-]+)|\[(\d+)\]/g;
//       let match;
//       while ((match = regex.exec(segment)) !== null) {
//         parts.push(match[1] ?? match[2]); // clé ou index
//       }
//     });

//     let level = newState;

//     for (let i = 0; i < parts.length - 1; i++) {
//       const key = parts[i];
//       const nextKey = parts[i + 1];

//       // créer niveaux manquants si inexistants
//       if (!(key in level) || level[key] == null) {
//         level[key] = /^\d+$/.test(nextKey) ? [] : {};
//       }

//       level = level[key];
//     }

//     const lastKey = parts[parts.length - 1];

//     // affectation finale
//     level[lastKey] = value;

//     return newState;
//   });
// };

// const set = (path, value) => {
//   setStates(prev => {
//     const newState = structuredClone(prev);

//     // extraire parties du chemin en conservant les crochets
//     const parts = [];
//     path.split(".").forEach(segment => {
//       const regex = /([\w-]+)|\[(\d*)\]/g; 
//       let match;
//       while ((match = regex.exec(segment)) !== null) {
//         if (match[1]) {
//           parts.push(match[1]);         // clé normale
//         } else if (match[2] === "") {
//           parts.push("__PUSH__");       // [] → push
//         } else {
//           parts.push(match[2]);         // [2] → "2"
//         }
//       }
//     });

//     let level = newState;

//     for (let i = 0; i < parts.length - 1; i++) {
//       const key = parts[i];
//       const nextKey = parts[i + 1];

//       // si push au prochain niveau → on doit avoir un tableau
//       const isNextPush = nextKey === "__PUSH__";

//       if (!(key in level) || level[key] == null) {
//         level[key] = isNextPush || /^\d+$/.test(nextKey) ? [] : {};
//       }

//       level = level[key];
//     }

//     const lastKey = parts[parts.length - 1];

//     // cas du push : []
//     if (lastKey === "__PUSH__") {
//       if (!Array.isArray(level)) {
//         throw new Error("Impossible de pousser dans un non-tableau");
//       }
//       level.push(value);
//     } 
//     else {
//       level[lastKey] = value;
//     }

//     return newState;
//   });
// };

const set = (path, value) => {
  setStates(prev => {
    const newState = structuredClone(prev);

    const parts = [];
    path.split(".").forEach(segment => {
      const regex = /([\w-]+)|\[(\d*)\]/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        if (match[1]) {
          parts.push(match[1]);
        } else if (match[2] === "") {
          parts.push("__PUSH__");
        } else {
          parts.push(match[2]);
        }
      }
    });

    let level = newState;

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      const nextKey = parts[i + 1];
      const isNextPush = nextKey === "__PUSH__";

      // ⚠️ NOUVEAU : si level[key] existe mais n'est pas un objet/tableau → on remplace !
      if (level[key] !== Object(level[key])) {
        level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
      }

      // création classique si key est absent
      if (!(key in level)) {
        level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
      }

      level = level[key];
    }

    const lastKey = parts[parts.length - 1];

    // Helper pour appliquer une fonction ou une valeur simple
    const applyValue = (target, keyOrIndex) => {
      const prevValue =
        keyOrIndex === "__PUSH__"
          ? target[target.length - 1]
          : target[keyOrIndex];

      const newValue =
        typeof value === "function" ? value(prevValue) : value;

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

      return newState;
    });
  };

  const parsePath = (path) => {
    const parts = [];
    path.split(".").forEach(segment => {
      const regex = /([\w-]+)|\[(\d*)\]/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        if (match[1]) {
          parts.push(match[1]);
        } else if (match[2] === "") {
          parts.push("__PUSH__");   // utilisé seulement dans set
        } else {
          parts.push(match[2]);     // index numérique
        }
      }
    });
    return parts;
  };

  const get = (path, root = states) => {
    const parts = parsePath(path);

    let level = root;

    for (const part of parts) {
      if (part === "__PUSH__") {
        // get([]) n’a aucun sens → undefined
        return undefined;
      }

      if (level == null) return undefined;
      if (!(part in level)) return undefined;

      level = level[part];
    }

    return level;
  };

  const unset = (path) => {
    setStates(prev => {
      const newState = structuredClone(prev);
      const parts = parsePath(path);

      const last = parts.pop();
      let level = newState;

      for (const part of parts) {
        if (part === "__PUSH__") {
          return newState; // impossible d’unset[] → on ignore
        }
        if (!(part in level)) {
          return newState; // rien à faire
        }
        level = level[part];
        if (level == null) return newState;
      }

      // Suppression finale
      if (Array.isArray(level) && /^\d+$/.test(last)) {
        // suppression dans tableau : remove index
        const index = Number(last);
        if (index >= 0 && index < level.length) {
          level.splice(index, 1);
        }
      } else {
        // suppression dans objet
        delete level[last];
      }

      return newState;
    });
  };

  return {
    states,
    set,
    unset,
    get
  };
};