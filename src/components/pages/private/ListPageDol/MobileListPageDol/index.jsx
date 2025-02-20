/*
 * MobileListPage
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

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi, useNavigator, useStates, useWindow } from "../../../../hooks";
import { useDispatch } from "react-redux";
import { isEmpty, searchBarFilter } from "../../../../../globals/functions";
import { Radio, Icon } from "../../../../dol";

export const MobileListPage = (props) => {
  const { config } = props;

  const navigation = config.app.navigation.mobilePortrait;

  const tab = ["", ""];

  const { deviceType } = useNavigator();

  const params = new URLSearchParams(useLocation().search);
           
  const { states, set } = useStates({
      id                : params.get("id") || null,

      boolean:true,
      checkbox: true,
      multipleCheckbox: ["Ouvert", "Livre"],
      radio: "Homme",
      select: "Ete",
      multipleSelect: ["Fete", "Plage", "Soiree"],
      array: ["Fete", "Plage", "Soiree"],
    
      isSelectingFew    : false,
      selected          : 1,
      isNotSelected     : true,
    
      list              : [],
      filteredList      : [],
      
      chosenTool        : "search",
      chosenStatus      : 0,
      // chosenFilter      : tab[0],
      filters           : [],

      searchBarValue: "",

      isSearchBarOpened: false,
      listMode: "column",

      openedOption: null,
    
      isGettingList     : true,

      opacityTransitions: {
                            initial: false,
                            tools  : true,
                          },

  });

  const content = {
    api: {
      path: "/expeditions",
      errorToast: {
        status: "error",
        title: "Erreur lors de la récupération de la liste",
        subtitle: "Veuillez réessayer ultérieurement.",
        auto: true,
        closeOnClick: true,
      },
    },
  };

  // const handleSearchBarOnChange = (value) => {
  //   setFilteredList(
  //     states.list.filter((obj) => {
  //       return content.searchableBy.some((filter) =>
  //         searchBarFilter(convertDol(obj, filter), value)
  //       );
  //     })
  //   );
  // };

  // const handleSelectedObjOnChange = (objP, OGIP, OIP) => {
  //   Object.states(objGroups).forEach((objGroup, OGI) => {
  //     if (OGIP == OGI) {
  //       objGroup.forEach((obj, OI) => {
  //         if (OIP == OI) {
  //           setSelectedObj(prevState => prevState !== objP ? objP : null);
  //         }
  //       })
  //     }
  //   });
  // };

  const bulkTimeout = useRef(null);

  useEffect(() => {
    set("opacityTransitions.initial", true);
    setTimeout(() => set("isGettingList", false), 1000);
  }, []);

  useEffect(() => set("opacityTransitions.tools", true), [states.chosenTool]);

  useEffect(() => {
  if (!Array.isArray(states.selected)) {
    if (!isEmpty(states.selected)) {
      set("isNotSelected", false);
    } else {
      setTimeout(() => set("isNotSelected", true), 300);
    }
  }
  }, [states.selected]);

  const tabbarList = ["Toutes", "En vente", "En promotion", "En Stock"];

  const tools = [
    {
      state: "search",
      label: "Configuration recherche",
      icon : {
        library: "io5",
        name: "IoSearchSharp"
        // library: "md",
        // name: "MdManageSearch"
      }
    },
    {
      state: "filter",
      label: "Configuration filtration données",
      icon : {
        library: "io5",
        name: "IoFilter"
      }
    },
    {
      state: "view",
      label: "Configuration affichage",
      icon : {
        library: "md",
        name: "MdOutlineRemoveRedEye"
      }
    }
  ];

  const details = [
    { type: "boolean", label: "Boolean", value: states.boolean },
    { type: "checkbox", label: "Checkbox", value: states.checkbox },
    { type: "multiCheckbox", label: "Checkbox multiple", value: states.multipleCheckbox },
    { type: "radio", label: "Radio", value: states.radio },
    { type: "select", label: "Select", value: states.select },
    { type: "multiSelect", label: "Select Multiple", value: states.multipleSelect },
    { type: "array", label: "Array", value: states.array },
    { type: "varchar", label: "Varchar", value: "Paolo Debaisieux"},
    { type: "mail", label: "Email", value: "paolo.debaisieux@gmail.com"},
    { type: "phone", label: "Phone", value: "+33653745243"},
    { type: "ip", label: "ip", value: "192.263.9.231"},
    { type: "link", label: "link", value: "google.com"},
    { type: "int", label: "int", value: 4},
    { type: "reel", label: "Reel", value: 4.344},
    { type: "double", label: "Double", value: 43},
    { type: "price", label: "Price", value: "4563€"},
    { type: "pricey", label: "Pricecy", value: "4563€"},
    { type: "timestamp", label: "Timestamp", value: 34242434334},
    { type: "date", label: "Date", value: "10/12/2003"},
    { type: "datetime", label: "Datetime", value: "10/12/2003 18:00"},
    { type: "time", label: "Time", value: "18:00"},
    { type: "duration", label: "Duration", value: "2 h 00 min"},
    { type: "text", label: "Text", value: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nesciunt fugit autem a provident voluptatibus iusto quam, laudantium, blanditiis ab praesentium ad in nam natus rerum obcaecati, omnis nisi unde corporis."},
    { type: "text:none", label: "Text:none", value: ""},
    { type: "html", label: "Html", value: <u>Text souligné via Html</u>},
    { type: "address", label: "Address", value: "1 Place Dassy 13013 Marseille"},
    { type: "gps", label: "Gps", value: ["48.8534100", "2.3488000"]},

    // { type: "ref", label: "Référence", value: "#1002322" },
    // { type: "date", label: "Date de livraison prévue", value: "12/12/04 18:00" },
    // { type: "select", label: "Statut", value: "Ouvert" },
    // { type: "description", label: "Contenu de la livraison", value: "Ordinateur ThinkPad + Souris Razer 360" },
    // { type: "price", label: "Prix", value: "230€" },
  ]

  return (
    <>
      <div 
        className={`col`} 
        onClick={() => {
          if (states.isOptionsOpened) {
            set("isOptionsOpened", false);            
          }
        }}
      >
        <div className={`sticky top-0 z-10`}>



      <navbar className={`gap-4 py-4 pr-2 pl-4 font-semibold text-white bg-primary dark:bg-dark dark:text-dark-text row-between-center`}>
            <p className={`flex-shrink-0 text-2xl`}>
              <Icon library={`fa6`} name={`FaBoxesStacked`} />
            </p>
            <p className={`flex-grow text-xl tracking-wide uppercase truncate`}>
              Produits | Paiements
            </p>    
            
            <div className={`flex-shrink-0 row-v-center`}>
                <div className={`hidden gap-1 p-1 bg-white rounded-md md:row-v-center dark:bg-dark-soft`}>
                    <input
                      value={states.searchBarValue}
                      onChange={(e) => set("searchBarValue", e.target.value)}
                      placeholder={`Recherchez...`}
                      className={`flex-grow p-1 min-w-0 font-normal bg-transparent outline-none text-smt placeholder-smt`}
                    />
                    <button className={`flex-shrink-0 p-1 text-2xl bg-white rounded-full text-primary button-smt dark:bg-dark-soft`}>
                      <Icon library={`io5`} name={`IoClose`} />
                    </button>
                  </div>
                <button className={`flex-shrink-0 p-2 text-2xl rounded-full md:hidden button-smt bg-primary dark:bg-dark`}>
                    <Icon library={`io`} name={`IoMdSearch`} />
                </button>
                <div className={`flex-shrink-0 row-v-center`}>
                  <button 
                      className={`flex-shrink-0 p-2 text-2xl rounded-full button-smt bg-primary dark:bg-dark`}
                      onClick={() => { switch (states.listMode) {
                          case "column": return set("listMode", "grid-2");
                          case "grid-2": return set("listMode", "grid-3");
                          case "grid-3": return set("listMode", "column");
                      }}}
                  >
                    change
                      {/* <Icon
                          library={`bs`}
                          name={(() => { switch (states.listMode) {
                              case "column": return "BsGrid";
                              case "grid-2": return "BsGrid3X3Gap";
                              case "grid-3": return "BsListUl";
                          }})()}
                      /> */}
                  </button>
                  {tools.map((tool, TI) =>
                      <button 
                          key={TI}
                          className={`hidden flex-shrink-0 p-2 text-2xl rounded-full md:block button-smt bg-primary dark:bg-dark`}
                          onClick={() => set("openedOption", tool.state)}
                      >
                          <Icon library={tool.icon.library} name={tool.icon.icon} />
                      </button>
                  )}
                </div>
                
            </div>
        </navbar>

        <div className="overflow-x-auto h-12 text-sm font-semibold text-white shadow-md  bg-smt row-between-center"
        >
          {tabbarList.map((element, EI) => 
            <button
              className={`
                tracking-wide uppercase flex-grow row-full-center relative h-full border-b-4 text-center button-smt bg-primary dark:bg-dark
                ${states.chosenStatus == EI ? "border-white text-white dark:text-dark-text dark:border-dark-text" : "text-slate-300 dark:text-dark-soft-text border-transparent"}
              `}
              style={{ transition: "border-color 300ms, color 300ms" }}
              onClick={() => set("chosenStatus", EI)}
            >
              <span className="px-4">{element}</span>
              {/* <span className={`absolute text-xs top-1 right-1 px-[2px] py-[1px] rounded-full duration-100 ${chosenStatus == EI ? "bg-white text-[#3f51b5]" : "bg-transparent border" }`}>14</span> */}
            </button>
          )}
        </div>
        </div>

        <div 
          className={`
             px-4 bg-white text-lg text-gray-500 dark:bg-dark z-40
              ${(states.isSelectingFew) ? "translate-y-0" : "-translate-y-full"} 
              h-28 fixed-h-center top-0 w-full duration-300
          `}
        >
          {/* <div className="gap-2 col-h-center"> */}
            <div className="gap-4 w-full h-full row-between-center">
              <label className="gap-4 p-2 -ml-2 bg-white rounded-md row-v-center button-smt" htmlFor="selectAll">
                <input 
                  type="checkbox"
                  id="selectAll"
                  className={`
                    ${!states.isSelectingFew ? "w-0 h-0 appearance-none" : "duration-50 checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none"} 
                  `} 
                  // checked={Array.isArray(} 
                />
                <span className="">Selectionner tout</span>
              </label>
              <div className="gap-2 row-v-center">
                <button 
                  className={`p-2 -mr-2 text-2xl bg-white rounded-full ring-white button-smt`} 
                  onClick={() => {
                    set("isSelectingFew", false);
                    set("selected", null);
                  }}
                >
                  <Icon
                    library={`fa6`}
                    name={`FaGear`}
                  />
                </button>
                <button 
                  className={`p-2 -mr-2 text-2xl bg-white rounded-full ring-white button-smt`} 
                  onClick={() => {
                    set("isSelectingFew", false);
                    set("selected", null);
                  }}
                >
                  <Icon
                    library={`io5`}
                    name={`IoCloseSharp`}
                  />
                </button>
              </div>
            </div>
            {/* <p>123 sélectionnés</p>
          </div> */}
        </div>

        {tab.length != 0 ? (<>
          <ul className={`
            text-sm text-gray-800
            ${(() => { switch (states.listMode) {
              case "column": return "col mt-4";
              case "grid-2": return "grid grid-cols-2 m-4 gap-4";
              case "grid-3": return "grid grid-cols-3 m-4 gap-4";
            }})()}
            ${states.opacityTransitions.initial ? "duration-300 opacity-100" : "opacity-0"}
          `}>
            {tab.map((element, EI) => (
              <li
                key={EI}
                onTouchStart={() => {
                  if (!states.isSelectingFew) {
                    bulkTimeout.current = setTimeout(() => {
                      set("isSelectingFew", true);
                      set("selected", [EI]);
                    }, 500);
                  }
                }}
                onTouchMove={() => clearTimeout(bulkTimeout.current)}
                onClick={() => {
                  clearTimeout(bulkTimeout.current);
                  if (states.isSelectingFew) {
                    set("selected", () => {
                      const newState = Array.isArray(states.selected) ? [...states.selected] : [];
                      const index = newState.findIndex(element => element === EI);
                      if (index != -1) {
                        newState.splice(index, 1);
                      } else {
                        newState.push(EI);
                      }
                      return newState;
                    });
                  } else {
                    set("selected", EI)
                  }
                }}
                className={`
                  ${states.isSelectingFew && "gap-4"}
                  ${(Array.isArray(states.selected) && states.selected.includes(EI)) && `brightness-96`}
                  ${!states.isGettingList && "border button-smt"} bg-smt text-smt border-smt relative shadow-md p-2 row-between-center
                `}
              >
                {states.isGettingList && <div className="absolute inset-0 bg-gray-200 rounded-md skeleton"/>}
                <input 
                  type="checkbox"
                  className={`
                    ${!states.isSelectingFew ? "w-0 h-0 appearance-none" : "checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none"} 
                  `} 
                  checked={Array.isArray(states.selected) && states.selected.includes(EI)} 
                />
                <div className={`
                  select-none flex-grow gap-2
                  ${states.listMode === "column" ? "row-between-center" : "wrap-v-center"}
                `}>
                  <p className={`${states.listMode !== "column" && "hidden"} font-semibold`}>{EI + 1}</p>
                  <p className="font-semibold text-primary">#1002322</p>
                  {/* <p className="text-soft-smt">12/12/04 18:00</p> */}
                  <p className="px-2 py-1 font-bold tracking-wide text-green-700 uppercase bg-green-500 bg-opacity-20 rounded-full shadow-md dark:text-green-500 dark:bg-opacity-10">Ouvert</p>
                  <p className="truncate text-soft-smt">Ordinateur ThinkPad + Souris Razer 360</p>
                  <p className="font-semibold">230 €</p>
                </div>
              </li>
            ))}
          </ul>
         </>
        ) : (
          <span className="text-lg text-center text-gray-400 absolute-full-center">
            Aucun objet trouvé
          </span>
        )}
        <div
          onClick={() => set("selected", null)}
          className={`
            ${(!Array.isArray(states.selected) && !isEmpty(states.selected)) ? "alert-smt" : "fixed bottom-0 right-0 left-0"}
            duration-300
          `}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`
              absolute right-0 left-0 bottom-0 bg-smt col-full-center h-2/3
              ${(!Array.isArray(states.selected) && !isEmpty(states.selected)) ? "translate-y-0 duration-300" : "translate-y-full"}
            `}
          >
            <button className={`absolute top-2 right-2 p-2 text-2xl rounded-full button-smt bg-smt text-soft-smt`}>
              <Icon library={`io5`} name={`IoClose`} />
            </button>
            <div className={`p-4 w-full h-full divide-x row divide-smt`}>
              <div className={`gap-4 p-4 col basis-1/3`}>
                <div className={`gap-4 text-2xl row-v-center`}>
                  <Icon library={`fa`} name={`FaTools`} className={`text-primary`} />
                  <p className={`text-xl font-bold uppercase`}>Actions</p>
                </div>
                <p>Classiques</p>
                <div className={`gap-2 wrap-v-center`}>
                  <button className={`flex-grow gap-2 p-2 text-white bg-yellow-500 rounded-md border-yellow-500 button-smt row-full-center dark:text-yellow-500 dark:bg-opacity-20 dark:border`}>
                    <Icon library={`md`} name={`MdEdit`} className={`text-xl`} />
                    <p className={``}>Modifier</p>
                  </button>
                  <button className={`flex-grow gap-2 p-2 text-white bg-red-500 rounded-md border-red-500 button-smt row-full-center dark:text-red-500 dark:bg-opacity-20 dark:border`}>
                    <Icon library={`fa`} name={`FaTrash`} className={`text-xl`} />
                    <p className={``}>Supprimer</p>
                  </button>
                </div>
                <p>Rapides</p>
                <div className={`gap-2 wrap-v-center`}>
                  <button className={`flex-grow gap-2 p-2 text-white bg-gray-500 rounded-md border-gray-500 button-smt row-full-center dark:text-gray-500 dark:bg-opacity-20 dark:border`}>
                    <Icon library={`md`} name={`MdEdit`} className={`text-xl`} />
                    <p className={``}>Stocker</p>
                  </button>
                  <button className={`flex-grow gap-2 p-2 text-white bg-green-500 rounded-md border-green-500 button-smt row-full-center dark:text-green-500 dark:bg-opacity-20 dark:border`}>
                    <Icon library={`fa`} name={`FaTrash`} className={`text-xl`} />
                    <p className={``}>Ouvrir</p>
                  </button>
                </div>
              </div>
              <div className="gap-4 p-4 col basis-2/3">
                <div className={`gap-4 px-4 text-xl row-v-center`}>
                  <Icon library={`fa6`} name={`FaBoxesStacked`} className={`text-3xl text-primary`} />
                  <p className={`font-bold uppercase`}>Détails du Produit | Paiement</p>
                </div>
                {/* <p className="text-3xl font-bold text-center">Produit | Paiement sélectionné</p> */}
                <dl className="overflow-auto max-h-full rounded-md border divide-y divide-smt border-smt">
                  {details.map(item =>
                    <div className={`p-2 w-full divide-x col md:row-between-center md:even:bg-soft-smt divide-smt`}>
                      <dt className={`py-2 pr-4 pl-2 md:basis-1/3 text-smt`}>{item.label}</dt>
                      <dd className={`gap-4 py-2 pr-2 pl-4 md:basis-2/3 text-soft-smt row-between-center`}>
                        {/* <Component type={item.type} value={item.value} />
                        <Button type={item.type} value={item.value} /> */}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
        <Link to={`/`} className={`fixed right-4 bottom-4 p-2 text-3xl text-white rounded-full button-smt bg-primary`}>
           <Icon library={`fa6`} name={`FaPlus`}/>
        </Link>
      </div>
    </>
  );
};