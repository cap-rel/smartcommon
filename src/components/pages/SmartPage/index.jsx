import { useEffect, useRef } from "react";
import { useStates } from "../../../hooks";
import { FaReact } from "react-icons/fa6";
import { IoArrowDown, IoHome } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { Tabbar, TabbarLink } from "../../navigation";
import { FaBook } from "react-icons/fa";
import { GpsPoints } from "../../form";
import { Variables } from "./Variables";
import { convertCSSVar } from "../../../globals/functions/variant";

export const SmartPage = () => {
    const { states, set } = useStates({
        test: "",
    });

    const { test } = states;

    const components = [
        {
            label: "Navigation",
            slug: "navigation",
            components: ["Navbar", "Sidebar", "SidebarLink", "Tabbar", "TabbarButton" ,"TabbarLink"]
        },
        {
            label: "Formulaire",
            slug: "form",
            components: ["Address", "Array", "Audios", "Boolean", "Check", "ColorPicker", "Duration", "Editor", "Files", "GpsPoints", "Input", "Label", "Photos", "Range", "Rating", "Select", "Signature", "Textarea", "Videos"]
        }
    ]

    useEffect(() => console.log(convertCSSVar()), []);

    return (
        <div className={`row fixed inset-0`}>
            <div className={`col w-50 shrink-0 h-full relative border-r border-soft bg-softest`}>   
                <div className={`sticky top-0 p-4 font-semibold uppercase text-lg row justify-center items-center bg-primary text-white`}>
                    Composants
                </div>
                <div className={`grow col overflow-y-auto py-4 gap-4 text-sm`}>
                    {components.map((group, GI) =>
                        <div 
                            key={`group${GI}`}
                            className={`col gap-2`}
                        >
                            <div className={`text-strongest font-semibold px-4 truncate uppercase`}>
                                {group.label}
                            </div>
                            <div className={`col`}>
                               {group.components.map((component, CI) =>
                                    <button 
                                        key={`component${CI}`}
                                        onClick={() => set("test", component)}
                                        className={`${test === component ? "bg-primary/20 text-strongest border-primary" : "hover:brightness-soft bg-softest border-softest text-stronger"} border-l-4 px-6 py-1 duration-100 row items-center gap-2 w-full cursor-pointer`}
                                    >
                                        <FaReact className={`${test === component ? "text-primary" : "text-stronger"}`} />
                                        <div className={`truncate`}>
                                            {component}
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`bg-softer row justify-center items-center`}>
                <div className={`bg-softer relative overflow-auto resize translate-y-0 shadow-md border rounded-xl h-210 w-100 scale-80 border-y-20 border-x-10 border-strongest`}>
                    <Tabbar className={``}>
                        <TabbarLink
                            label={`Accueil`}
                            to={`/`}
                            icon={<IoHome />}
                            // variant={"classic"}
                        />
                        <TabbarLink
                            label={`Carnet`}
                            to={`/2`}
                            icon={<FaBook />}
                        />
                    </Tabbar>
                </div>
            </div>

            <div className={`grow bg-softest border-x border-soft h-full`}>

            </div>
            <Variables />
                
        </div>
    );
};