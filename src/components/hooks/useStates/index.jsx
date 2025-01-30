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
import Resizer from "react-image-file-resizer";
import { isEmpty } from "../../../globals/functions";

// TODO Fixer le bug quand deux même string se suivent (ex: "test.test")

export const useStates = (initialValues, handleSubmitAction) => {
  const [states, setStates] = useState(initialValues);

  // let match = keys[i].match(/(\w+)\[(\d+)\]$/);
  // if (match) {
  //   level = level[match[1]][match[2]];
  // } else {
  //   level = level[keys[i]];
  // }
  // level[keys[keys.length - 1]] = value;

  // HandleInputOnChange
  const HIOC = (input, value) => {
    setStates((prevState) => {
      const newState = { ...prevState };
      const keys = input.split(".");
      let level = newState;
      const regex = /(\w+)|\[(\d+)\]/g;

      keys.forEach((key) => {
        let tab = [];
        let match;

        while ((match = regex.exec(key)) !== null) {
          if (match[1]) {
            tab = [...tab, match[1]];
          }
          if (match[2]) {
            tab = [...tab, match[2]];
          }
        }
        tab = tab.length > 1 ? tab : null;

        if (key != keys[keys.length - 1]) {
          if (tab) {
            level[tab[0]] = [...level[tab[0]]];
            level = level[tab[0]];
            for (let i = 1; i < tab.length; i++) {
              if (i != tab.length - 1) {
                level[tab[i]] = [...level[tab[i]]];
              }else{
                level[tab[i]] = { ...level[tab[i]] };
              }
              level = level[tab[i]];
            }
          } else {
            level[key] = { ...level[key] };
            level = level[key];
          }
        } else {
          if (tab) {
            level[tab[0]] = [...level[tab[0]]];
            level = level[tab[0]];
            for (let i = 1; i < tab.length; i++) {
              if (i != tab.length - 1) {
                level[tab[i]] = [...level[tab[i]]];
                level = level[tab[i]];
              } else {
                level[tab[i]] = value;
              }
            }
          } else {
            level[key] = value;
          }
        }
      });
      return newState;
    });
  };

  const set = (input, value) => { HIOC(input, value); }

  const finalizeValues = () => {
    const finalizedValues = { ...states };
    Object.keys(states).forEach(key => { 
      const { prefix, root, suffix } = states[key];
      finalizedValues[key] = 
        (!isEmpty(prefix) && !isEmpty(suffix) && !isEmpty(root))
          ? `${prefix || ""}${root}${suffix || ""}`
          : root
    });
    return finalizedValues
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitAction(e, finalizeValues());
  };


  return {
    states,
    setStates,
    finalizeValues,
    HIOC,
    set,
    handleSubmit,
  };
};