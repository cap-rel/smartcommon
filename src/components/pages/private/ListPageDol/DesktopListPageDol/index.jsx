/*
 * DesktopListPage
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
import { Icon } from "../../../../dol";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApi, useStates, useAnimation, useWindow } from "../../../../hooks";
import { useDispatch } from "react-redux";
import { hexToRgb, isEmpty, searchBarFilter } from "../../../../../globals/functions";
import hexToRgba from "hex-to-rgba";

export const DesktopListPage = (props) => {
  const { config } = props;

  const primaryColor = config.app.colors.primary;
  const secondaryColor = config.app.colors.secondary;

  const { darkMode, windowDimension } = useWindow()

  const params = new URLSearchParams(useLocation().search);

  const title = "Liste des produits";

  const fastActions = [
    { label: "Retirer de la vente", color: "#57534e", icon: { library: "fa6", icon: "FaBox" } },
    { label: "Mettre en vente", color: "#22c55e", icon: { library: "fa6", icon: "FaBoxOpen" } },
    { label: "Promotion", color: "#06b6d4", icon: { library: "md", icon: "MdSell" } },
    // { label: "Envoyer un mail", color: "#06b6d4", icon: { library: "md", icon: "MdEmail" } },
    { label: "Supprimer", color: "#ef4444", icon: { library: "fa6", icon: "FaTrashCan" } },
  ];

  const test = () => { return (
  <ul className="col gap-3 list-disc font-semibold text-base">
        <li className="text-green-600">type</li>
        <li className="text-green-600">label</li>
        <li className="text-blue-600">picto - icon devant input ?</li>
        <li className="text-blue-600">enabled - ?</li>
        <li className="text-green-600">position</li>
        {/* <li className="text-red-600">notnull</li> */}
        <li className="text-green-600">visible</li>
        <li className="text-blue-600">noteditable - ?</li>
        {/* <li className="text-red-600">alwayseditable</li> */}
        <li className="text-green-600">default</li>
        {/* <li className="text-red-600">index</li> */}
        <li className="text-blue-600">foreignkey ?</li>
        <li className="text-green-600">searchall</li>
        <li className="text-blue-600">isameasure- ?</li>
        {/* <li className="text-red-600">css</li> */}
        <li className="text-green-600">help</li>
        <li className="text-blue-600">showoncombobox - ?</li>
        <li className="text-blue-600">disabled - ?</li>
        <li className="text-green-600">arrayofkeyval</li>
        {/* <li className="text-red-600">autofocusoncreate</li>
        <li className="text-red-600">comment</li>
        <li className="text-red-600">validate</li>
        <li className="text-red-600">copytoclipboard</li> */}
      </ul>
  )}

  /* TODO

    / TYPE => INPUT    => varchar(a), double(a, b), real, price, date, datetime, timestamp, duration, mail, phone, url, password, ip
        => MULTIPLE => select, selllist, chkbxlist:..., checkbox, radio, array, boolean
        => TEXTAREA => text, text:none
        => EDITOR   => html
        => FILE     => file
    
    / LABEL => label.

    / PLACEHOLDER => placeholder.

    / VISIBLE => on s'occupe que du 0 (pas visible), 1 (liste), 2 (détails), 3 (liste et détails). 4 et 5 sont très rares.
    
    / POSITION => détermine la position des attributs les uns par rapport aux autres dans la liste.
    
    / PICTO => Icône se plaçant devant l'attribut dans liste et formulaires. On ne le fera que pour les formulaires.

    / ENABLED => true/1 si visible sur les formulaires (différent de VISIBLE), false/0 si non visible sur les formulaires.
    / DISABLED => On n'utilisera pas disabled de dolibarr. On utilisera un disabled pour désactiver les inputs en mode view.
    / NOTEDITABLE => true/1 si désactivé, false/0 si non désactivé.

    / REQUIRED => true/1 si requis, false/0 si non requis.

    / DEFAULT => valeur par défaut dans les formulaires de création.

    / SEARCHALL => true/1 si recherchable via la barre de recherche, false/0 si non recherchable.

    / HELP => Petite popup donnant des informations sur le remplissage de l'input.

    / PREFIX => text se situant avant l'input. Peut aussi servir d'aide au remplissage ou simple information.
    / SUFFIX => text se situant avant l'input. Peut aussi servir d'aide au remplissage ou simple information.

    / INPUTPREFIX => text ou select se situant à l'avant de l'input qui fait partie de la valeur de sa valeur. (ex: inputPrefix: "+33", value: "678386373")
    / INPUTSUFFIX => text ou select se situant à l'arrière de l'input qui fait partie de la valeur de sa valeur.

    / STEPPER => si true, met en place un stepper pour n'importe quel input "nombre".
    / STEP => définit un step qui par défaut est 1

    / PATTERN => Si le pattern fourni n'est pas valide, la validation des données ne peut s'éffectuer et une petite notification en rouge au niveau de l'input apparaît

  */

  const attributes = {
    alive          : { type: 'boolean'     , label: 'Vivant'             , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    label          : { type: 'varchar(255)', label: 'Label'             , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    array          : { type: 'array'       , label: 'Taille'               , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // password       : { type: 'password'    , label: 'Mot de passe'       , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    check         : { type: 'checklist'      , label: 'Catégories'             , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    link          : { type: 'link'   , label: 'Lien vers le site'          , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    lastname           : { type: 'varchar(255)'        , label: 'Prix'               , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    firstname       : { type: 'varchar(255)', label: 'Date de création'                , placeholder: "", enabled: 1, position: 1, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    birthday      : { type: 'varchar(255)', label: 'Date de sortie'             , placeholder: "", enabled: 1, position: 2, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // birthday       : { type: 'date'        , label: 'Date de sortie'  , placeholder: "", enabled: 1, position: 3, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // adress         : { type: 'varchar(255)', label: 'Adresse'            , placeholder: "", enabled: 1, position: 4, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // city           : { type: 'varchar(255)', label: 'Code Postal'        , placeholder: "", enabled: 1, position: 5, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // phone          : { type: 'phone'       , label: 'Numéro de téléphone', placeholder: "", enabled: 1, position: 6, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // email          : { type: 'mail'        , label: 'Adresse email'      , placeholder: "", enabled: 1, position: 7, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // cv             : { type: 'text'        , label: 'CV'                 , placeholder: "", enabled: 1, position: 8, visible: 3, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // cardfullname   : { type: 'varchar(255)', label: 'Nom sur la carte'   , placeholder: "", enabled: 1, position: 9, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // cardnumber     : { type: 'varchar(255)', label: 'Numéro de carte'    , placeholder: "", enabled: 1, position: 10, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // resiliationdate: { type: 'varchar(255)', label: 'Date de péremption' , placeholder: "", enabled: 1, position: 11, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // secretnumber   : { type: 'varchar(255)', label: 'Numéro secret'      , placeholder: "", enabled: 1, position: 12, visible: 1, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // test           : { type: 'varchar(255)', label: 'Test'               , placeholder: "", enabled: 1, position: 13, visible: 0, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
    // test2          : { type: 'varchar(255)', label: 'Test2'              , placeholder: "", enabled: 1, position: 14, visible: 2, noteditable: 0, required: 1, searchall: 1, help: "1 première aide" },
  }

  const copy = {
      alive          : 0,
      label          : "Pantalon jean gris",
      array          : ["S", "M", "L"],
      // password       : "HKDHKFSDF",
      // select         : { value: "Ouvert", color: "#22c55e"},
      check          : [{ value: "Eté", color: "#ff9800"}, { value: "Homme", color: "#1eb8fe"}, { value: "Fête", color: "#673ab7"}],
      link           : "https://google.com",
      lastname       : "150€",
      firstname      : "03/08/2003",
      birthday       : "03/08/2003",
      // adress         : "1 Boulevard test",
      // city           : "Toulouse",
      // phone          : "0675544332",
      // email          : "paolo.debaisieux@gmail.com",
      // cv             : "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium dolore autem asperiores atque voluptatum sint, illo veniam ut consequatur fugit cum, saepe numquam quos nulla harum iusto corrupti praesentium doloremque?",
      // cardfullname   : "PAOLO DEBAISIEUX",
      // cardnumber     : "55366366535536635",
      // resiliationdate: "09/24",
      // secretnumber   : "456",
      // test           : "test",
      // test2          : "test 2",
  }
  const copy2 = {
    alive          : 1,
    label          : "Veste verte",
    array          : ["XXS", "XS", "S", "M", "L"],
    // password       : "HKDHKFSDF",
    // select         : { value: "Ouvert", color: "#22c55e"},
    check          : [{ value: "Eté", color: "#ff9800"}, { value: "Homme", color: "#1eb8fe"}, { value: "Fête", color: "#673ab7"}],
    link           : "https://google.com",
    lastname       : "150€",
    firstname      : "03/08/2003",
    birthday       : "03/08/2003",
    // adress         : "1 Boulevard test",
    // city           : "Toulouse",
    // phone          : "0675544332",
    // email          : "paolo.debaisieux@gmail.com",
    // cv             : "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium dolore autem asperiores atque voluptatum sint, illo veniam ut consequatur fugit cum, saepe numquam quos nulla harum iusto corrupti praesentium doloremque?",
    // cardfullname   : "PAOLO DEBAISIEUX",
    // cardnumber     : "55366366535536635",
    // resiliationdate: "09/24",
    // secretnumber   : "456",
    // test           : "test",
    // test2          : "test 2",
}

  const tab = [
    { values: copy },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy2 },
    { values: copy },
    { values: copy },
    { values: copy2 },
    { values: copy },
    { values: copy2 },
    { values: copy2 },
    { values: copy },
  ];

  const status = [
    { label: "Toutes" },
    { label: "En vente", color: "#22c55e" },
    { label: "En promotion", color: "#06b6d4" },
    { label: "En Stock", color: "#94a3b8" }
  ];

  const tools = [
    { state: "search", label: "Configuration recherche", icon : { library: "io5", icon: "IoSearchSharp" } },
    { state: "filter", label: "Configuration filtration données", icon : { library: "io5", icon: "IoFilter" } },
    { state: "view", label: "Configuration affichage", icon : { library: "fa6", icon: "FaRegEye" } }
  ];

  const { states, set } = useStates(
    {
      id                : params.get("id") || null,
    
      isSelectingFew    : false,
      selected          : [],
      isNotSelected     : true,
    
      list              : [],
      filteredList      : [],
      page              : 1,
      nbPerPage         : 10,
    
      scale             : 100,
      isOnFullScreen    : false,

      searchBar         : "",
    
      isToolsOpened     : false,
      chosenTool        : "search",
      chosenStatus      : 0,
      chosenFilter      : tab[0],
      filters           : [],
    
      isGettingList     : true,

      opacityTransitions: {
                            initial: false,
                            tools  : true,
                            afterGettingData: false
                          },
    }
  );

  const navigate = useNavigate();

  const handleSearchBarOnChange = (value) => {
    set("filteredList",
        states.list.filter(element => {
            return content.searchableBy.some((filter) =>
                searchBarFilter(filter, value)
            );
        })
    );
  };


  useEffect(() => {
    set("opacityTransitions.initial", true);
    setTimeout(() => {
        set("isGettingList", false);
        set("opacityTransitions.afterGettingData", true);
    }, 1000);
}, []);


  useEffect(() => set("opacityTransitions.tools", true), [states.chosenTool]);

  // useEffect(() => {
  //   if (!Array.isArray(states.selected)) {
  //     if (!isEmpty(states.selected)) {
  //       set("isNotSelected", false);
  //     } else {
  //       setTimeout(() => {
  //         set("isNotSelected", true);
  //       }, 300);
  //     }
  //   }
  // }, [states.selected]);

  const table = useRef(null);

  useEffect(() => table.current.scrollTo(0, 0) ,[states.page]);

  return (
    <>
      <div 
        className={`
            col m-4 text-gray-500 text-sm absolute inset-0 shadow-md
            ${states.opacityTransitions.initial ? "duration-300 opacity-100" : "opacity-0"}
          `}
      >
        <div className={`bg-dol shadow-md h-full relative rounded-md`}>
         {states.isGettingList && <div className="absolute z-20 inset-0 skeleton rounded-md bg-dol"/>}
         <div 
          className={`
            col w-full h-full 
            ${states.opacityTransitions.afterGettingData ? "duration-300 opacity-100" : "opacity-0"}
          `}
        >
         <div className="row-between-center gap-4 px-4 py-4 border-b border-gray-500">
          <span className="text-gray-800 dark:text-white text-2xl font-bold">{title}</span>
          <div className="row-v-center gap-4 h-full">
            {fastActions.map((fastAction, FAI) => 
              <button
                key={`fastAction${FAI}`}
                title={`${isEmpty(states.selected) && "Vous devez d'abord sélectionner au moins un élément"}`} 
                className={`
                  ${!isEmpty(states.selected) ? "animate-wiggle button-dol" : "brightness-80 cursor-not-allowed"} 
                  row-v-center gap-2 text-base px-4 py-2 text-white border-2 rounded-md
                `}
                style={{ 
                  color: darkMode ? (isEmpty(fastAction.color) ? primaryColor : fastAction.color) : "white",
                  backgroundColor: darkMode ? hexToRgba(isEmpty(fastAction.color) ? primaryColor : fastAction.color, 0.2) : (isEmpty(fastAction.color) ? primaryColor : fastAction.color),
                  borderColor: (isEmpty(fastAction.color) ? primaryColor : fastAction.color)
                }}
              >
                {!isEmpty(fastAction.icon) &&
                  <Icon
                    library={fastAction.icon.library}
                    icon={fastAction.icon.icon}
                    className={`text-xl`}
                  />
                }
                <span>{fastAction.label}</span>
              </button>
            )}
            
            <div className={`w-[1px] h-full bg-gray-200 dark:bg-gray-500`}/>
            <button 
              className={`
                button-dol row-v-center gap-2 text-base px-4 py-2 bg-primary dark:bg-primary-20 border-2 border-primary rounded-md
                ${darkMode ? "text-primary" : "text-white"}
              `}
              style={{ 
                // color: darkMode ? primaryColor : "white",
                // backgroundColor: !darkMode && primaryColor,
                // borderColor: primaryColor
              }}  
            >
              <Icon
                library={`fa6`}
                icon={`FaPlus`}
                className={`text-xl`}
              />
              <span>Nouveau</span>
            </button>
          </div>
        </div>
        <div
          className={`row-between-center gap-4 p-4 bg-white dark:bg-dark rounded-t-md border-b border-gray-500`}
        >
          <div className="row-v-center gap-4">
            <input 
              value={states.searchBar}
              onChange={(e) => set("searchBar", e.target.value)}
              placeholder="Recherche..." 
              className="bg-white dark:bg-transparent text-black border dark:border-gray-500 rounded-md w-80 p-2 accent-[#3f51b5]"
            />
            <div className="relative z-10">
            <button 
              className={`button-dol text-xl p-1 bg-white dark:bg-dark rounded-md text-primary`} 
              onClick={() => set("isToolsOpened", !states.isToolsOpened)}
            >
              <Icon
                // library={`fa`}
                // icon={`FaTools`}
                icon={`IoSettingsSharp`}
                library={`io5`}
              />
            </button>
                <div 
                  className={`
                      shadow-lg absolute-h-center w-80 overflow-y-auto rounded-md 
                      top-[calc(100%+32px)] col bg-white text-gray-800 border-2 
                      ${!states.isToolsOpened && "hidden"}
                  `}
                >
                  <div className="row-v-center">
                  {tools.map((tool, TI) => 
                    <button 
                      key={TI}
                      onClick={() => {
                        if (tool.state !== states.chosenTool) {
                          set("opacityTransitions.tools", false);
                          set("chosenTool", tool.state);
                        }
                      }}
                      className={`
                        px-4 py-2 flex-grow border-b-2 text-center button-dol bg-white text-xl
                        ${states.chosenTool === tool.state ? "text-[#3f51b5] border-[#3f51b5]" : "text-gray-300 border-white"}
                      `}
                      // 
                      style={{ transition: "border-color 300ms, color 300ms" }}
                    >
                      <Icon
                        library={tool.icon.library}
                        icon={tool.icon.icon}
                        className={`mx-auto`}
                      />
                      {/* <span className={`absolute text-xs top-1 right-1 px-[2px] py-[1px] rounded-full duration-100 ${chosenStatus == EI ? "bg-white text-[#3f51b5]" : "bg-transparent border" }`}>14</span> */}
                    </button>
                  )}
              </div>
              <div className={`col ${states.opacityTransitions.tools ? "duration-300 opacity-100" : "opacity-0"}`}>
                <div className={`p-4 font-semibold text-black text-center border-b`}>
                  {tools.find(tool => tool.state === states.chosenTool).label}
                </div>
                <div className={`${states.chosenTool !== "search" && "hidden"} col max-h-120 text-gray-500 overflow-y-auto`}>
                  {Object.values(attributes).map(element => 
                    <label className={`row-between-center cursor-pointer px-4 py-2 gap-4 bg-white button-dol`}>
                      <span className="truncate">{element.label}</span>
                      <input type="checkbox" className={`checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none`} />
                    </label>
                  )}
                </div>
                <div className={`${states.chosenTool !== "filter" && "hidden"} col max-h-120 text-gray-500 overflow-y-auto`}>
                    <p>Filtration des données</p>
                </div>
                <div className={`${states.chosenTool !== "view" && "hidden"} col max-h-120 text-gray-500 overflow-y-auto`}>
                  {states.chosenTool === "view" && Object.values(attributes).map(element => 
                    <label className={`row-between-center cursor-pointer px-4 py-2 gap-4 bg-white button-dol`}>
                      <span className="truncate">{element.label}</span>
                      <input type="checkbox" className="checkbox checkbox-sm [--chkbg:blue] [--chkfg:white] checked:border-none" />
                    </label>
                  )}
                </div>
                </div>
                {/* <div className="px-4 py-2 text-white bg-[#3f51b5] font-semibold row-between-center gap-4">
                  <div className="row-v-center gap-2">
                    <Icon
                      library={`io5`}
                      icon={`IoSearchSharp`}
                      className="text-xl"
                    />
                    <span>Configuration recherche</span>
                  </div>
                  <button 
                    className={`button-dol ring-white text-xl p-1 -mr-1 text-white rounded-md bg-[#3f51b5]`} 
                    onClick={() => set("chosenTool", null)}
                >
                    <Icon
                      library={`io5`}
                      icon={`IoCloseSharp`}
                    />
                  </button>
                </div>
                <div className="px-4 py-2 row-v-center gap-4 bg-gray-100">
                  <input className="bg-transparent outline-none flex-grow" placeholder="Rechercher..."/>
                  <button className={`text-xl rounded-md text-gray-400`}>
                    <Icon
                      library={`io5`}
                      icon={`IoCloseSharp`}
                    />
                  </button>
                </div>
                <div className="col overflow-y-auto">
                {tab.map(element => 
                  <label className="label cursor-pointer px-4 py-2 duration-100 active:bg-gray-200">
                    <span className="">{element}</span>
                    <input type="checkbox" className="checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none" />
                  </label>
                )}
                </div>
              </div>
              <div 
                className={`
                    shadow-lg absolute-h-center rounded-md top-[calc(100%+20px)] 
                    col bg-white text-gray-800 border-2 ${states.chosenTool !== "filter" && "hidden"}
                `}
            >
                <div className="px-4 py-2 text-white bg-[#3f51b5] font-semibold rounded-t-md row-between-center gap-2">
                  <div className="row-v-center gap-2">
                    <Icon
                      library={`io5`}
                      icon={`IoFilter`}
                      className="text-xl"
                    />
                    <span>Configuration filtration</span>
                  </div>
                  <button 
                    className={`button-dol ring-white row-v-center gap-1 text-xl p-1 -mr-1 text-white rounded-md bg-[#3f51b5]`} 
                    onClick={() => set("chosenTool", null)}
                >
                    <Icon
                      library={`io5`}
                      icon={`IoCloseSharp`}
                    />
                  </button>
                </div>
                <div className={`row gap-4 p-4`}>
                  <div className="col-between gap-4">
                    <div className="col gap-4 w-80">
                      <select 
                        className="px-2 py-1 rounded-md" 
                        value={states.chosenFilter} 
                        onChange={(e) => set("chosenFilter", [ ...e.target.selectedOptions].map(option => option.value))}
                    >
                        {tab.map(element => <option value={element}>{element}</option>)}
                      </select>
                      <hr />

                      <div className="col gap-2">
                        <label htmlFor="">Valeur :</label>
                        <input className="w-full border bg-gray-100 rounded-md px-2 py-1" placeholder="Valeur..."/>
                      </div>

                      <div className="row-v-center gap-2">
                        <input className="w-1/2 border bg-gray-100 rounded-md px-2 py-1" placeholder="0"/>
                        <Icon
                          library={`io`}
                          icon={`IoIosArrowBack`}
                          className="text-2xl"
                        />
                        <p>Valeur</p>
                        <Icon
                          library={`io`}
                          icon={`IoIosArrowBack`}
                          className="text-2xl"
                        />
                        <input className="w-1/2 border bg-gray-100 rounded-md px-2 py-1" placeholder="0"/>
                      </div>

                      <div className="col gap-2">
                        <div className="row-v-center gap-2">
                          <p>De</p>
                          <input className="w-full border bg-gray-100 rounded-md px-2 py-1" type="datetime-local"/>
                        </div>
                        <div className="row-v-center gap-4">
                          <p>A</p>
                          <input className="w-full border bg-gray-100 rounded-md px-2 py-1" type="datetime-local"/>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="text-white rounded-md bg-[#3f51b5] px-3 py-2 button-dol font-semibold"
                      onClick={() => set("filters", [...states.filters, states.chosenFilter])}
                    >
                      Ajouter le filtre
                    </button>
                  </div>
                  <div className="w-[1px] bg-gray-200"/>
                  <div className="col-h-center gap-2">
                    <span className="font-semibold">Filtres</span>
                    <div className="w-80 border rounded-md wrap p-2 gap-2">
                      {states.filters.map((filter, FI) =>
                        <div key={FI} className="bg-orange-200 border border-orange-400 row-v-center gap-2 rounded-md px-2 py-1">
                          <p className="text-[#3f51b5] font-semibold">{filter}</p>
                          <Icon 
                            library={`rx`}
                            icon={`RxCross2`}
                            className="text-orange-400"
                            onClick={(e) => {
                              e.preventDefault();
                              const newFilters = [...filters];
                              newFilters.splice(FI, 1);
                              set("filters", newFilters);
                            }}
                          />
                      </div> 
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div 
                className={`
                    shadow-lg absolute-h-center w-80 overflow-y-auto max-h-100 rounded-md top-[calc(100%+20px)] 
                    col bg-white text-gray-800 border-2 ${states.chosenTool !== "view" && "hidden"}`}
                >
                <div className="px-4 py-2 text-white bg-[#3f51b5] font-semibold row-between-center gap-2">
                  <div className="row-v-center gap-2">
                    <Icon
                      library={`fa`}
                      icon={`FaRegEye`}
                      className="text-xl"
                    />
                    <span>Configuration affichage</span>
                  </div>
                  <button 
                    className={`button-dol row-v-center gap-1 text-xl p-1 -mr-1 text-white rounded-md bg-[#3f51b5]`} 
                    onClick={() => set("chosenTool", null)}
                >
                    <Icon
                      library={`io5`}
                      icon={`IoCloseSharp`}
                    />
                  </button>
                </div>
                <div className="px-4 py-2 row-v-center gap-4 bg-gray-100">
                  <input className="bg-transparent outline-none flex-grow" placeholder="Rechercher..."/>
                  <button className={`text-xl rounded-md text-gray-400`}>
                    <Icon
                      library={`io5`}
                      icon={`IoCloseSharp`}
                    />
                  </button>
                </div>
                <div className="col overflow-y-auto">
                {tab.map(element => 
                  <label className="label cursor-pointer px-4 py-2 duration-100 active:bg-gray-200">
                    <span className="">{element}</span>
                    <input type="checkbox" className="checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none" />
                  </label>
                )}
                </div>
              </div>
            </div>
            {/* <div className="relative">
              <button className={`button-dol text-2xl text-[#3f51b5]`} onClick={() => setIsTagsOpened(prevState => !prevState)}>
                <Icon
                  library={`lu`}
                  icon={`LuTags`}
                />
              </button>
              <div                 
                // isOpened={isOpened && isOpened.searchBar}
                // setIsOpened={setIsOpened}
                className={`${!isTagsOpened && "hidden"} absolute-h-center bg-white col w-60 text-xs border shadow-xl rounded-md`}
            >
                <p className="text-center bg-gray-100 p-2 font-semibold">Catégories</p>
                <hr />
                <div className="">
                  {tab.map(element => 
                    <label className="label cursor-pointer p-1.5 duration-100 active:bg-gray-200">
                      <span className="">blabla</span>
                      <input type="checkbox" className="checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none" />
                    </label>
                  )}
                </div> */}
            </div>
            </div>
            {/* <button 
              className={`button-dol text-xl p-1 bg-white dark:bg-dark rounded-md text-primary`} 
            >
              <Icon
                icon={`GiSaveArrow`}
                library={`gi`}
              />
            </button> */}
          </div>
          <div className="row-v-center rounded-md border border-dol overflow-x-auto">
            {status.map((status, SI) => 
              <button
                className={`
                  ${SI != states.chosenStatus ? "button-dol" : "brightness-100"} 
                  ${SI == 0 && "rounded-l-md"} 
                  ${SI == status.length - 1 && "rounded-r-md"} 
                  uppercase font-bold tracking-wide px-4 py-2 text-xs duration-100 dark:bg-dark
                `}
                key={`status${SI}`}
                onClick={() => set("chosenStatus", SI)}
                style={{ 
                  backgroundColor: SI == states.chosenStatus ? hexToRgba(!isEmpty(status.color) ? status.color : primaryColor , 0.12) : (darkMode ? "transparent" : "white"),
                  color: SI == states.chosenStatus && (!isEmpty(status.color) ? status.color : primaryColor ),
                }}
              >
                <span className="">{status.label}</span>
              </button>
            )}
          </div>
          <div className="row-v-center gap-4 h-full">
            <div className="row-v-center gap-4 text-gray-500">
              <button 
                className={`button-dol text-primary text-xl p-1 rounded-md bg-white dark:bg-dark`} 
                onClick={() => set("scale", states.scale > 0 ? states.scale - 5 : 0)}
            >
                <Icon
                  library={`fa6`}
                  icon={`FaMinus`}
                />
              </button>
              <span className={`text-secondary`}>{states.scale}%</span>
              <button 
                className={`button-dol text-primary text-xl p-1 rounded-md bg-white dark:bg-dark`} 
                onClick={() => set("scale", states.scale < 300 ? states.scale + 5 : 300)}
            >
                <Icon
                  library={`fa6`}
                  icon={`FaPlus`}
                />
              </button>
            </div>
            <div className={`w-[1px] h-full bg-gray-200 dark:bg-slate-700`}/>
            {/* <button 
                className={`button-dol text-primary text-xl p-1 rounded-md bg-white dark:bg-dark`} 
                onClick={() => set("isOnFullScreen", !states.isOnFullScreen)}
            >
              <Icon
                library={`pi`}
                icon={states.isOnFullScreen ? "PiArrowsInFill" : "PiArrowsOutFill"}
              />
            </button> */}
          </div>
        </div>
        <div 
          className={`overflow-auto flex-grow`}
          ref={table}
        >
          <table 
            className={`text-gray-800 dark:text-white text-left w-full border-y border-y-500 border-collapse dark:border-slate-700`} 
            style={{ fontSize: `${14 * states.scale / 100}px`, lineHeight: `${20 * states.scale / 100}px`}}
            // style={{ transform: `scale(${states.scale / 100})`, transformOrigin: 'top left'}}
          >
            <thead className="font-semibold z-10 sticky top-0">
              <tr className="text-dol bg-light-border dark:bg-dark-border">
                <th 
                  className="whitespace-nowrap" 
                  style={{ padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                >
                  <input type="checkbox" className={`checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none`} />
                </th>
                <th 
                  className="whitespace-nowrap" 
                  style={{ padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                >
                  {/* <div className="row-v-center gap-2"> */}
                    <span>N°</span>
                    {/* <Icon 
                      className="text-[#3f51b5]" 
                      icon={`FaSort`} 
                      library={`fa6`} 
                    /> */}
                  {/* </div> */}
                </th>
                {Object.values(attributes).filter((element, EI) => element.visible != 0 && element.visible != 3).map(element => 
                  <th 
                    className="cursor-pointer whitespace-nowrap" 
                    style={{ gap: `${8 * states.scale / 100}px`, padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                  >
                    <div className="row-v-center gap-2">
                      <span>{element.label}</span>
                      <Icon 
                        className="text-primary" 
                        icon={`FaSort`} 
                        library={`fa6`} 
                      />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
              <tbody className="overflow-y-auto">
                {tab.filter((element, EI) => EI <= (states.nbPerPage * states.page) - 1 && EI >= (states.nbPerPage * states.page) - states.nbPerPage).map((element, EI) =>
                  <tr
                    className={`
                      hover:bg-primary-10 cursor-pointer 10 duration-100
                      ${EI%2 != 0 && "bg-soft-dol"}
                    `}
                    key={EI}
                    onClick={() => navigate(`/list/${EI}`)}
                    style={{ transitionProperty: "background" }}
                  >
                    <td 
                      className="whitespace-nowrap border-y dark:border-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        set("selected", !states.selected.includes(EI) ? [...states.selected, EI] : [...states.selected].filter(check => check != EI))
                      }} 
                      style={{ padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                    >
                      {/* <label 
                        htmlFor={EI}
                      > */}
                        <input 
                          id={EI}
                          checked={states.selected.includes(EI)}
                          className={`checkbox checkbox-sm [--chkbg:#3f51b5] [--chkfg:white] checked:border-none`} 
                          onChange={(e) => set("selected", e.target.checked ? [...states.selected, EI] : [...states.selected].filter(check => check != EI))}
                          type="checkbox"
                        />
                        {/* </label> */}
                    </td>
                    <td 
                      className="whitespace-nowrap font-bold border-y dark:border-slate-700" 
                      style={{ padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                    >
                      {states.nbPerPage * states.page - states.nbPerPage + EI + 1}
                    </td>
                    {Object.keys(element.values)
                    .filter((key, EI) => attributes[key].visible != 0 && attributes[key].visible != 3)
                    .map((key, EI) => 
                      <td 
                        className="whitespace-nowrap border-y dark:border-slate-700" 
                        style={{ padding: `${8 * states.scale / 100}px ${16 * states.scale / 100}px` }}
                      >
                        {attributes[key].type === "boolean" 
                          ? ""
                          : <div
                              className={`
                                ${attributes[key].type === "mail" && "underline"}
                                ${attributes[key].type === "phone" && "font-bold italic"}
                                ${attributes[key].type === "password" && "font-bold italic"}
                              `}
                              // truncate
                              onClick={(e) => attributes[key].type === "link" && e.stopPropagation()}
                            >
                              {attributes[key].type === "password" 
                                ? Array.from({ length: element.values[key].length }).map(() => "*")
                                : attributes[key].type === "link"
                                  ? <a className="link-dol text-secondary" href={element.values[key]}>{element.values[key]}</a>
                                  : (attributes[key].type === "array" || attributes[key].type === "checklist" || attributes[key].type === "sellist")
                                    ? <div className="wrap gap-1 w-40 uppercase text-xs">
                                        {element.values[key].map((tag, TI) => 
                                          <div 
                                            className={`px-2 py-0.5 rounded-full shadow-md`}
                                            key={`${key}${TI}`}
                                            // style={{ backgroundColor: typeof tag === "object" ? `rgb(${hexToRgb(tag.color)}, 0.2)` : `rgb(${hexToRgb("#3f51b5")}, 0.2)` }}
                                            style={{ 
                                              backgroundColor: typeof tag === "object" ? hexToRgba(tag.color, 0.2) : hexToRgba(primaryColor, 0.2),
                                            }}
                                          >
                                            <div 
                                              className={`brightness-80 tracking-wide font-semibold`}
                                              style={{ color: typeof tag === "object" ? tag.color : primaryColor}}
                                            >
                                              {typeof tag === "object" ? tag.value : tag}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    : (attributes[key].type === "select" || attributes[key].type === "check")
                                      ? <div 
                                          className={`shadow-md text-xs px-2 py-0.5 rounded-full bg-opacity-20 uppercase`}
                                          style={{ backgroundColor: typeof element.values[key] === "object" ? hexToRgba(element.values[key].color, 0.2) : hexToRgba(primaryColor, 0.2) }}
                                          >
                                          <div 
                                            className={`brightness-80 tracking-wide font-semibold`}
                                            style={{ color: typeof element.values[key] === "object" ? element.values[key].color : primaryColor}}
                                          >
                                            {element.values[key].value}
                                          </div>
                                        </div>
                                      : element.values[key]
                              }
                            </div>
                        }
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
          </table>
        </div>
        <div 
          className={`row-between-center gap-4 p-4 bg-white dark:bg-dark border-t-2 dark:border-gray-500 rounded-b-md`}
        >
          <span>
            Montre du {states.nbPerPage * states.page - states.nbPerPage + 1}{" "}
            au {(states.nbPerPage * states.page) <= tab.length ? states.nbPerPage * states.page : tab.length}{" "}
            sur {tab.length} résultats
          </span>
          <div className="row-v-center rounded-md border-2 dark:border-gray-500 divide-x-2 dark:divide-gray-500">
            <select 
              className="p-2 bg-white rounded-l-lg dark:bg-dark"
              onChange={(e) => set("nbPerPage", e.target.value)} 
              value={states.nbPerPage}
            >
              <option>10</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="p-2 ">par page</span>
          </div>
          <div className="row-v-center rounded-md border">
          <button 
            className={`button-dol text-xl p-2 border bg-white dark:bg-dark dark:border-gray-500 rounded-l-lg`} 
            onClick={() => set("page", states.page == 1 ? states.page : states.page - 1)}
        >
            <Icon
              library={`io`}
              icon={`IoIosArrowBack`}
            />
            {/* <div className="w-[1px] bg-gray-200 h-full"/> */}
          </button>
          {Array.from({ length: Math.ceil(tab.length / states.nbPerPage) }).map((page, EI) =>
            // EI == Math.round(tab.length / 2)
            //   ? <span>...</span>
            //   : 
            <>
              {/* {((EI >= 0 && EI <= 4) || (EI >= Math.max(0, Math.ceil(tab.length / nbPerPage) - 5) && EI <= Math.ceil(tab.length / nbPerPage) - 1)) && */}
                <button 
                  onClick={() => set("page", EI + 1)}
                  className={`
                    p-2 w-10 border dark:border-gray-500
                    ${states.page == EI + 1 ? "text-white bg-[#3f51b5]" : "bg-white button-dol" }
                  `}
                >
                  {EI + 1}
                </button>
              {/* } */}
            </>
          )}
          <button 
            className={`button-dol text-xl p-2 border bg-white`} 
            onClick={() => set("page", states.page == Math.ceil(tab.length / states.nbPerPage) ? states.page : states.page + 1)}
        >
            <Icon
              library={`io`}
              icon={`IoIosArrowForward`}
            />
          </button>
          </div>
        </div>
        </div>
        </div>

      </div>
    </>
  );
};
