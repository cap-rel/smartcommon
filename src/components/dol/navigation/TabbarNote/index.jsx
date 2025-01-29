import { Link, useLocation } from "react-router-dom";
import { IconDol } from "../../../dol";
import { useNavigator } from "../../../hooks";
import { isEmpty } from "../../../../globals/functions";

const TabbarNote = () => {
    const location = useLocation();
    const { deviceType, darkMode } = useNavigator();

    const elements = [
        {
            label: "Menu",
            toPath: "/",
            reactIcon: { library: "io5", icon: "IoHome" },
            // reactActiveIcon: { library: "fa6", icon: "FaRegCalendar" },
        },
        {
            label: "Carnet",
            toPath: "/notes",
            // reactIcon: { library: "fa6", icon: "FaListUl" },
            reactIcon: { library: "fa", icon: "FaBook" },
            // reactActiveIcon: { library: $"fa6", icon: "FaCalendarDays" },
        },
        {
            label: "Synchroniser",
            toPath: "/sync",
            reactIcon: { library: "fa", icon: "FaSyncAlt" },
            // onClick: e => {
            //     console.log("Sauvegarde en cours ...");
            //     setTimeout(() => console.log("Sauvegarde effectuée ..."), 2000);
            // }
        },
        {
            label: "Paramètres",
            toPath: "/settings",
            // reactIcon: { library: "fa6", icon: "FaListUl" },
            reactIcon: { library: "fa6", icon: "FaGear" },
            // reactActiveIcon: { library: "fa6", icon: "FaCalendarDays" },
        },
    ];

    return (
        <div className={`absolute z-10 bg-dol gap-4 px-2 border-dol left-0 right-0 bottom-0 h-16 row-between-center border-t shadow-lg`}>
            {elements.map((link, LI) => 
                <Link
                    key={"tabbarLink_" + LI}
                    to={link.toPath}
                    className={`duration-300 text-dol h-full col-full-center basis-1/4 bg-dol active:brightness-90 dark:active:brightness-125`}
                >
                    <IconDol
                        library={(location.pathname === link.toPath) ? (!isEmpty(link.reactActiveIcon) ? link.reactActiveIcon.library : link.reactIcon.library): link.reactIcon.library}
                        icon={(location.pathname === link.toPath) ? (!isEmpty(link.reactActiveIcon) ? link.reactActiveIcon.icon : link.reactIcon.icon) : link.reactIcon.icon}
                        className={`
                            text-xl mx-auto duration-300
                            ${location.pathname === link.toPath ? "text-primary" : "text-soft-dol"}
                        `}
                    />
                    <div className={`
                        truncate text-sm duration-300
                        ${location.pathname === link.toPath ? "text-primary" : "text-soft-dol"}
                    `}>
                        {link.label}
                    </div>
                </Link>
            )}
        </div>
    );
};

export default TabbarNote;
