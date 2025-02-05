import { useEffect } from "react";
import { useStates } from "../../../../hooks";
import { hexToRgb, isEmpty } from "../../../../../globals/functions";
import { HexColorPicker } from "react-colorful";
import { Input, Icon, Select, Alert } from "../../../../dol"
import hexToRgba from "hex-to-rgba";

export const SettingsPage = (props) => {
    const { states, set } = useStates(
        {
            selectedSetting   : 1, 
            isGettingData     : true,
            selectedColor     : null,
            settingsData: {
                0: {
                    telCode: "",
                    currency: "",
                    language: "",
                    dateFormat: "",
                    timeFormat: ""
                },
                1: {
                    navigation: {
                        mobile: "",
                        tablet: "",
                        desktop: ""
                    },
                    darkMode: false,
                    colors: {
                        primary: "#3f51b5",
                        secondary: "#fe347e",
                        success: "#22c55e",
                        error: "#ef4444",
                        warning: "#fbbf24"
                    }
                }
            },
            opacityTransitions: {
                                    initial: false,
                                    afterGettingData: false
                                },
        }
      );
    
      useEffect(() => {
        set("opacityTransitions.initial", true);
        setTimeout(() => {
            set("isGettingData", false);
            set("opacityTransitions.afterGettingData", true);
        }, 1000);
    }, []);

    const colors = [
        { name: "primary"  , label: "Primaire"        },
        { name: "secondary", label: "Secondaire"      },
        { name: "success"  , label: "Succès"          },
        { name: "error"    , label: "Erreur | Danger" },
        { name: "warning"  , label: "Avertissement"   }
    ];

    const settings = [
        { label: "Paramètres généraux"  , icon: { library: "bs" , name: "BsFillGearFill"     }, description: "Définissez la langue, la devise, ... de votre DoliMobile"    },
        { label: "Thèmes et couleurs"   , icon: { library: "io5", name: "IoColorFilterSharp" }, description: "Définissez le thème et les couleurs de votre DoliMobile"     },
        { label: "Accessibilité"        , icon: { library: "io5", name: "IoAccessibility"    }, description: "Gérer tous vos paramètres d'accessissibilité"                },
        { label: "SmartAuth"            , icon: { library: "si" , name: "SiAuthelia"         }, description: "Accéder et personnalisez vos sessions comme bon vous semble" },
        { label: "Affichage des entités", icon: { library: "md" , name: "MdDisplaySettings"  }, description: "Personnalisez l'affichage pour chaque entité"                },
        { label: "Filtres des entités"  , icon: { library: "io5", name: "IoFilter"           }, description: "Définissez les filtres par défaut pour chaque entité"        }
    ];

    const entities = [
        { name: "tiers", label: "Tiers", color: "#fe9e21", icon: { library: "fa6", name: "FaUser" } },
        { name: "tiers", label: "Produits", color: "#2fa3e9", icon: { library: "ai", name: "AiFillProduct" } },
        { name: "tiers", label: "Ventes", color: "#4caf50", icon: { library: "md", name: "MdSell" } },
        { name: "tiers", label: "Site de stock", color: "#8a4af3", icon: { library: "fa6", name: "FaBox" } },
        { name: "tiers", label: "Projets", color: "#ed1b66", icon: { library: "fa", name: "FaProjectDiagram" } },
        { name: "tiers", label: "Factures | Paiements sqddqsd ", color: "#0e0e0e", icon: { library: "ri", name: "RiFilePaper2Fill" } },
        { name: "tiers", label: "Tiers", color: "#fe9e21", icon: { library: "fa6", name: "FaUser" } },
        { name: "tiers", label: "Produits", color: "#2fa3e9", icon: { library: "ai", name: "AiFillProduct" } },
        { name: "tiers", label: "Ventes", color: "#4caf50", icon: { library: "md", name: "MdSell" } },
        { name: "tiers", label: "Site de stock", color: "#8a4af3", icon: { library: "fa6", name: "FaBox" } },
        { name: "tiers", label: "Projets", color: "#ed1b66", icon: { library: "fa", name: "FaProjectDiagram" } },
        { name: "tiers", label: "Factures | Paiements", color: "#0e0e0e", icon: { library: "ri", name: "RiFilePaper2Fill" } },
    ]

    // const [primaryColor, setPrimaryColor] = useColor("#3f51b5");
    // const [secondaryColor, setSecondaryColor] = useColor("#fe347e")

    const setSettingPage = (SI) => {
        switch (SI) {
            case 0:
                return (
                    <div className="col-h-center gap-4 w-full">
                        <div className="row-between-center py-2 px-4 w-full border shadow-md rounded-md">
                            <p className="text-gray-800 font-semibold">Langue</p>
                            <Select
                                options={["🇨🇵 FR", "🇬🇧 EN", "🇩🇪 GM"]}
                            />
                        </div>
                        <div className="row-between-center py-2 px-4 w-full border shadow-md rounded-md">
                            <p className="text-gray-800 font-semibold">Indicatif téléphonique <span className="text-gray-500 font-normal">(par défaut)</span></p>
                            <Select
                                options={["🇨🇵 +33", "🇬🇧 +44", "🇩🇪 +49"]}
                            />
                        </div>
                        <div className="row-between-center py-2 px-4 w-full border shadow-md rounded-md">
                            <p className="text-gray-800 font-semibold">Devise <span className="text-gray-500 font-normal">(par défaut)</span></p>
                            <Select
                                options={["€", "£", "🇩$"]}
                            />
                        </div>
                        <div className="col w-full border shadow-md rounded-md divide-y">
                            <div className="row-between-center py-2 px-4">
                                <p className="text-gray-800 font-semibold">Format de la date <span className="text-gray-500 font-normal">(par défaut)</span></p>
                                <Select
                                    options={["€", "£", "🇩$"]}
                                />
                            </div>
                            <div className="row-between-center py-2 px-4">
                                <p className="text-gray-800 font-semibold">Format de l'heure <span className="text-gray-500 font-normal">(par défaut)</span></p>
                                <Select
                                    options={["€", "£", "🇩$"]}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <>
                    <div className="col gap-6 w-full">
                        <div className="col gap-4">
                            <p className="text-gray-800 font-semibold text-base">Navigation</p>
                            <div className="col border shadow-md bg-gray-50 bg-opacity-10 rounded-md divide-y">
                                <div className="row-between-center gap-4 py-2 px-4">
                                    <p className="text-gray-800 font-semibold">Téléphone portable</p>
                                    <Select
                                        options={["Tab bar inférieure", "Tab bar supérieure", "Sidebar gauche", "Sidebar droite"]}
                                        value={states.settingsData[1].mobileNavigation}
                                        onChange={(newValue) => set("settingsData.1.mobileNavigation", newValue)}
                                    />
                                </div>
                                <div className="row-between-center gap-4 py-2 px-4">
                                    <p className="text-gray-800 font-semibold">Tablette</p>
                                    <Select
                                        options={["Tab Bar inférieure", "Tab Bar supérieure", "Sidebar gauche", "Sidebar droite"]}
                                        value={states.settingsData[1].tabletNavigation}
                                        onChange={(newValue) => set("settingsData.1.tabletNavigation", newValue)}
                                    />
                                </div>
                                <div className="row-between-center gap-4 py-2 px-4">
                                    <p className="text-gray-800 font-semibold">Ordinateur / écran de bureau</p>
                                    <Select
                                        options={["Navbar", "Sidebar gauche", "Sidebar droite"]}
                                        value={states.settingsData[1].desktopNavigation}
                                        onChange={(newValue) => set("settingsData.1.desktopNavigation", newValue)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col gap-4">
                            <p className="text-gray-800 font-semibold text-base">Thème</p>
                            <div className="row-between-center gap-4 py-2 px-4 w-full rounded-md shadow-md border">
                                <p className="text-gray-800 font-semibold">Mode sombre</p>
                            </div>
                            <div className="col w-full divide-y shadow-md border rounded-md">
                                {colors.map((color, CI) =>
                                    <div
                                        key={CI}
                                        className={`
                                            row-between-center gap-4 py-2 px-4 
                                            ${CI == 0 ? "rounded-t-md" : (CI == colors.length - 1 && "rounded-b-md")}
                                        `}
                                        style={{ backgroundColor: hexToRgba(Object.values(states.settingsData[1].colors)[CI], 0.1) }}
                                    >
                                        <p className="text-gray-800 font-semibold">{color.label}</p>
                                        <button
                                            className="rounded-full w-6 h-6"
                                            style={{ backgroundColor: Object.values(states.settingsData[1].colors)[CI] }}
                                            onClick={() => set("selectedColor", color.name)}
                                        ></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* <div className="col gap-4">
                            <p className="text-gray-800 font-semibold text-base">Entités</p>
                            <div className="grid grid-cols-2 gap-4">
                                {entities.map((entity, EI) =>
                                    <button
                                        key={EI}
                                        className={`
                                            p-4 row-between-center gap-4 rounded-md
                                            button-smt shadow-md duration-200
                                        `}
                                        style={{ backgroundColor: `rgb(${hexToRgb(entity.color)}, 0.1)` }}
                                    >
                                        <div className="row-v-center gap-4 truncate">
                                            <Icon
                                                className={`w-8 h-auto flex-shrink-0`}
                                                name={entity.icon.icon}
                                                library={entity.icon.library}
                                                style={{ color: entity.color }}
                                            />
                                            <p className="text-gray-800 font-semibold truncate">{entity.label}</p>
                                        </div>
                                        <Icon
                                            name={`IoIosArrowForward`}
                                            library={`io`}
                                        />
                                    </button>
                                )}
                            </div>
                        </div> */}
                    </div>
                    <Alert
                        isOpened={states.selectedColor}
                        setIsOpened={(newValue) => set("selectedColor", newValue)}
                    >
                        <div className={`rounded-md bg-white row-v-center p-6 gap-6`}>
                            <div className="w-full">
                                {/* <ColorPicker color={primaryColor} onChange={setPrimaryColor} /> */}
                                <HexColorPicker
                                    className="w-100" 
                                    color={states.settingsData[1].colors[states.selectedColor]}
                                    onChange={(newValue) => set(`settingsData.1.colors.${states.selectedColor}`, newValue)}
                                />
                            </div>
                            <div className="col gap-4 text-black">
                                <p className="font-semibold">
                                    Couleur {colors.find(color => color.name == states.selectedColor)?.label || ""}
                                </p>
                                <div className={`col gap-2`}>
                                    <label htmlFor="colorPickerHex">
                                        HEX
                                    </label>
                                    <input
                                        id={`colorPickerHex`}
                                        value={states.settingsData[1].colors[states.selectedColor]}
                                        className="border-2 p-2 rounded-md"
                                    />
                                </div>
                                <div className={`col gap-2`}>
                                    <label htmlFor="colorPickerRgba">
                                        RGB
                                    </label>
                                    <input
                                        id={`colorPickerRgba`}
                                        value={states.settingsData[1].colors[states.selectedColor]}
                                        className="border-2 p-2 rounded-md"
                                    />
                                </div>
                                {/* <button 
                                    className={`button-smt bg-gray-500 px-4 py-2 font-semibold rounded-md text-white`}
                                    onClick={() => set("selectedColor", null)}
                                >
                                    Revenir à la couleur par défaut
                                </button> */}
                            </div>
                        </div>
                    </Alert>
                    </>
                );
            case 2:
                return (
                    ""
                );
            case 3:
                return (
                    ""
                );
            case 4:
                return (
                    ""
                );
            case 5:
                return (
                    ""
                );
            
        }
    }

    return (
        
          <div
            className={`
                hidden m-4 lg:col text-gray-500 text-sm absolute inset-0
                ${states.opacityTransitions.initial ? "duration-300 opacity-100" : "opacity-0"}
            `}
          >
                    <div className={`bg-white shadow-md h-full relative rounded-md`}>
                    {states.isGettingData && <div className="absolute z-20 inset-0 skeleton rounded-md bg-white"/>}
         <div 
          className={`
            row w-full h-full pl-4 gap-4
            ${states.opacityTransitions.afterGettingData ? "duration-300 opacity-100" : "opacity-0"}
          `}
        >
            <div className="col gap-4 py-4 text-gray-500 basis-1/5">
                {settings.map((setting, SI) =>
                    <button 
                        className={`
                            row gap-4 p-4 duration-100 hover:bg-[#3f51b5] hover:bg-opacity-10 rounded-md
                            ${states.selectedSetting == SI && "bg-[#3f51b5] bg-opacity-10"}
                        `}
                        key={SI}
                        onClick={() => set("selectedSetting", SI)}
                    >
                        <Icon
                            className={`w-10 h-auto flex-shrink-0 ${states.selectedSetting == SI && "text-[#3f51b5]"}`}
                            name={setting.icon.icon}
                            library={setting.icon.library}
                        />
                        <div className={`col gap-2 text-start`}>
                            <p className={`text-gray-800 font-semibold`}>{setting.label}</p>
                            <p>{setting.description}</p>
                        </div>
                    </button>
                )}
            </div>
            <div className={`h-full w-1 bg-gray-200`} />
            <div className="flex-grow py-8 overflow-auto">
                {settings.map((setting, SI) => 
                    <div className={`col-h-center mx-auto w-1/2 gap-8 ${states.selectedSetting != SI && "hidden"}`}>
                        <div className="self-start row-v-center gap-4">
                            <div className=" p-2 rounded-md bg-[#3f51b5]">
                                <Icon
                                    className={`text-3xl text-white`}
                                    name={setting.icon.icon}
                                    library={setting.icon.library}
                                />
                            </div>
                            <p className={` text-[#3f51b5] font-semibold text-2xl`}>{setting.label}</p>
                        </div>
                        {setSettingPage(SI)}
                    </div>
                )}
            </div>
        
    
{/* 
  <div className="row-between-center gap-4 w-full">
  <button 
      className={`
        row-v-center gap-2 py-2 px-4 bg-gray-500 button-smt 
        rounded-md text-white font-semibold
      `}
    >
      <Icon
        library={"md"}
        name={"MdCancel"}
        className={`text-xl`}
      />
      <p>Annuler</p>
    </button>
    <button 
      className={`
        row-v-center gap-2 py-2 px-4 bg-green-500 button-smt 
        rounded-md text-white font-semibold
      `}
    >
      <Icon
        library={"md"}
        name={"MdCheckCircle"}
        className={`text-xl`}
      />
      <p>Sauvegarder</p>
    </button>
  </div>  */}
  </div></div>
      </div>);
};