/*
 * MobileListPageDol
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
import { useApi, useNavigator, useStates, useWindow } from "../../../../../hooks";
import { useDispatch } from "react-redux";
import { isEmpty, searchBarFilter } from "../../../../../../globals/functions";
import { RadioDol, IconDol } from "../../../../../dol";

const MobileListPageDol = (props) => {
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
        icon: "IoSearchSharp"
        // library: "md",
        // icon: "MdManageSearch"
      }
    },
    {
      state: "filter",
      label: "Configuration filtration données",
      icon : {
        library: "io5",
        icon: "IoFilter"
      }
    },
    {
      state: "view",
      label: "Configuration affichage",
      icon : {
        library: "md",
        icon: "MdOutlineRemoveRedEye"
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



      <navbar className={`bg-primary dark:bg-dark text-white dark:text-dark-text row-between-center py-4 pl-4 pr-2 gap-4 font-semibold`}>
            <p className={`text-2xl flex-shrink-0`}>
              <IconDol library={`fa6`} icon={`FaBoxesStacked`} />
            </p>
            <p className={`text-xl uppercase tracking-wide truncate flex-grow`}>
              Produits | Paiements
            </p>    
            
            <div className={`row-v-center flex-shrink-0`}>
                <div className={`hidden md:row-v-center gap-1 p-1 rounded-md bg-white dark:bg-dark-soft`}>
                    <input
                      value={states.searchBarValue}
                      onChange={(e) => set("searchBarValue", e.target.value)}
                      placeholder={`Recherchez...`}
                      className={`min-w-0 flex-grow font-normal text-dol p-1 bg-transparent placeholder-dol outline-none`}
                    />
                    <button className={`text-2xl text-primary flex-shrink-0 p-1 button-dol bg-white dark:bg-dark-soft rounded-full`}>
                      <IconDol library={`io5`} icon={`IoClose`} />
                    </button>
                  </div>
                <button className={`md:hidden text-2xl flex-shrink-0 button-dol p-2 bg-primary dark:bg-dark rounded-full`}>
                    <IconDol library={`io`} icon={`IoMdSearch`} />
                </button>
                <div className={`row-v-center flex-shrink-0`}>
                  <button 
                      className={`text-2xl flex-shrink-0 button-dol p-2 bg-primary dark:bg-dark rounded-full`}
                      onClick={() => { switch (states.listMode) {
                          case "column": return set("listMode", "grid-2");
                          case "grid-2": return set("listMode", "grid-3");
                          case "grid-3": return set("listMode", "column");
                      }}}
                  >
                    change
                      {/* <IconDol
                          library={`bs`}
                          icon={(() => { switch (states.listMode) {
                              case "column": return "BsGrid";
                              case "grid-2": return "BsGrid3X3Gap";
                              case "grid-3": return "BsListUl";
                          }})()}
                      /> */}
                  </button>
                  {tools.map((tool, TI) =>
                      <button 
                          key={TI}
                          className={`hidden md:block text-2xl flex-shrink-0 button-dol p-2 bg-primary dark:bg-dark rounded-full`}
                          onClick={() => set("openedOption", tool.state)}
                      >
                          <IconDol library={tool.icon.library} icon={tool.icon.icon} />
                      </button>
                  )}
                </div>
                
            </div>
        </navbar>

        <div className="
          shadow-md bg-dol text-sm font-semibold text-white 
          h-12 row-between-center overflow-x-auto"
        >
          {tabbarList.map((element, EI) => 
            <button
              className={`
                tracking-wide uppercase flex-grow row-full-center relative h-full border-b-4 text-center button-dol bg-primary dark:bg-dark
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
          {/* <div className="col-h-center gap-2"> */}
            <div className="row-between-center gap-4 h-full w-full">
              <label className="row-v-center gap-4 p-2 -ml-2 button-dol bg-white rounded-md" htmlFor="selectAll">
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
              <div className="row-v-center gap-2">
                <button 
                  className={`button-dol ring-white text-2xl p-2 -mr-2 rounded-full bg-white`} 
                  onClick={() => {
                    set("isSelectingFew", false);
                    set("selected", null);
                  }}
                >
                  <IconDol
                    library={`fa6`}
                    icon={`FaGear`}
                  />
                </button>
                <button 
                  className={`button-dol ring-white text-2xl p-2 -mr-2 rounded-full bg-white`} 
                  onClick={() => {
                    set("isSelectingFew", false);
                    set("selected", null);
                  }}
                >
                  <IconDol
                    library={`io5`}
                    icon={`IoCloseSharp`}
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
                  ${!states.isGettingList && "border button-dol"} bg-dol text-dol border-dol relative shadow-md p-2 row-between-center
                `}
              >
                {states.isGettingList && <div className="skeleton absolute inset-0 rounded-md bg-gray-200"/>}
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
                  <p className="text-primary font-semibold">#1002322</p>
                  {/* <p className="text-soft-dol">12/12/04 18:00</p> */}
                  <p className="text-green-700 dark:text-green-500 py-1 px-2 tracking-wide font-bold bg-green-500 bg-opacity-20 dark:bg-opacity-10 rounded-full shadow-md uppercase">Ouvert</p>
                  <p className="text-soft-dol truncate">Ordinateur ThinkPad + Souris Razer 360</p>
                  <p className="font-semibold">230 €</p>
                </div>
              </li>
            ))}
          </ul>
         </>
        ) : (
          <span className="absolute-full-center text-center text-gray-400 text-lg">
            Aucun objet trouvé
          </span>
        )}
        <div
          onClick={() => set("selected", null)}
          className={`
            ${(!Array.isArray(states.selected) && !isEmpty(states.selected)) ? "alert-dol" : "fixed bottom-0 right-0 left-0"}
            duration-300
          `}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`
              absolute right-0 left-0 bottom-0 bg-dol col-full-center h-2/3
              ${(!Array.isArray(states.selected) && !isEmpty(states.selected)) ? "translate-y-0 duration-300" : "translate-y-full"}
            `}
          >
            <button className={`absolute top-2 right-2 p-2 button-dol bg-dol text-2xl text-soft-dol rounded-full`}>
              <IconDol library={`io5`} icon={`IoClose`} />
            </button>
            <div className={`row divide-x divide-dol w-full h-full p-4`}>
              <div className={`col gap-4 p-4 basis-1/3`}>
                <div className={`row-v-center gap-4 text-2xl`}>
                  <IconDol library={`fa`} icon={`FaTools`} className={`text-primary`} />
                  <p className={`text-xl font-bold uppercase`}>Actions</p>
                </div>
                <p>Classiques</p>
                <div className={`wrap-v-center gap-2`}>
                  <button className={`button-dol flex-grow row-full-center p-2 gap-2 text-white dark:text-yellow-500 bg-yellow-500 dark:bg-opacity-20 dark:border border-yellow-500 rounded-md`}>
                    <IconDol library={`md`} icon={`MdEdit`} className={`text-xl`} />
                    <p className={``}>Modifier</p>
                  </button>
                  <button className={`button-dol flex-grow row-full-center p-2 gap-2 text-white dark:text-red-500 bg-red-500 dark:bg-opacity-20 dark:border border-red-500 rounded-md`}>
                    <IconDol library={`fa`} icon={`FaTrash`} className={`text-xl`} />
                    <p className={``}>Supprimer</p>
                  </button>
                </div>
                <p>Rapides</p>
                <div className={`wrap-v-center gap-2`}>
                  <button className={`button-dol flex-grow row-full-center p-2 gap-2 text-white dark:text-gray-500 bg-gray-500 dark:bg-opacity-20 dark:border border-gray-500 rounded-md`}>
                    <IconDol library={`md`} icon={`MdEdit`} className={`text-xl`} />
                    <p className={``}>Stocker</p>
                  </button>
                  <button className={`button-dol flex-grow row-full-center p-2 gap-2 text-white dark:text-green-500 bg-green-500 dark:bg-opacity-20 dark:border border-green-500 rounded-md`}>
                    <IconDol library={`fa`} icon={`FaTrash`} className={`text-xl`} />
                    <p className={``}>Ouvrir</p>
                  </button>
                </div>
              </div>
              <div className="col gap-4 basis-2/3 p-4">
                <div className={`row-v-center gap-4 px-4 text-xl`}>
                  <IconDol library={`fa6`} icon={`FaBoxesStacked`} className={`text-primary text-3xl`} />
                  <p className={`font-bold uppercase`}>Détails du Produit | Paiement</p>
                </div>
                {/* <p className="text-center font-bold text-3xl">Produit | Paiement sélectionné</p> */}
                <dl className="divide-y divide-dol border border-dol rounded-md max-h-full overflow-auto">
                  {details.map(item =>
                    <div className={`col md:row-between-center md:even:bg-soft-dol divide-dol p-2 divide-x w-full`}>
                      <dt className={`md:basis-1/3 text-dol py-2 pl-2 pr-4`}>{item.label}</dt>
                      <dd className={`md:basis-2/3 text-soft-dol py-2 pr-2 pl-4 row-between-center gap-4`}>
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
        <Link to={`/`} className={`button-dol fixed bottom-4 p-2 text-3xl bg-primary rounded-full text-white right-4`}>
           <IconDol library={`fa6`} icon={`FaPlus`}/>
        </Link>
      </div>
    </>
  );
};

export default MobileListPageDol;