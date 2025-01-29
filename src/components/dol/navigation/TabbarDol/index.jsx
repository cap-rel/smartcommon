import { Link, useLocation } from "react-router-dom";
import { IconDol } from "../../../dol";
import { useNavigator } from "../../../hooks";
import { isEmpty, sortArray } from "../../../../globals/functions";
import { useEffect } from "react";

const TabbarDol = (props) => {
  const { config } = props;

  const navigation = config.navigation;

  const location = useLocation();
  const { deviceType, darkMode } = useNavigator();

  const linkGroups = [
    {
      title: "Général",
      icon: { library: "lu", icon: "LuHome" },
      links: [
        {
          label: "Tableau de bord",
          toPath: "/",
          icon: { library: "fa6", icon: "FaRegCalendar" },
          activeIcon: { library: "fa6", icon: "FaRegCalendar" },
        }, 
        {
          label: "Agenda",
          toPath: "/agenda",
          icon: { library: "fa6", icon: "FaRegCalendar" },
          activeIcon: { library: "fa6", icon: "FaCalendarDays" },
        }
      ]
    },
    {
      title: "Objets",
      icon: { library: "fa", icon: "FaList" },
      links: sortArray(config.objects, "position").map(object => {
        if ((deviceType === "mobile" && object.visibilityOnDevices.mobile) || (deviceType === "tablet" && object.visibilityOnDevices.tablet)) {
          return ({
            label: object.pluralLabel,
            toPath: `/${object.slug}`,
            colors: object.colors,
            icon: object.icon,
            activeIcon: object.activeIcon
          });
        }
      })
    },
  ];

  useEffect(() => {
    console.log(sortArray(config.objects, "position").map(object => {
      if ((deviceType === "mobile" && object.visibilityOnDevices.mobile) || (deviceType === "tablet" && object.visibilityOnDevices.tablet)) {
        return ({
          label: object.pluralLabel,
          toPath: `/${object.slug}`,
          colors: object.colors,
          icon: object.icon,
          activeIcon: object.activeIcon
        });
      }
    }));
    
  }, []);


  return (
    <div className={`fixed z-10 bg-dol gap-4 px-2 border-dol left-0 right-0 bottom-0 h-18 row-between-center border-t`}>
      {linkGroups.map((linkGroup, LGI) =>
        linkGroup.links.map((link, LI) => !isEmpty(link) && (
          <Link
            key={LI}
            to={link.toPath}
            className={`
              text-dol col-full-center gap-1 flex-grow active:brightness-90 dark:active:brightness-125
            `}
          >
            <div className={`
              p-1 rounded-full w-1/3
               ${location.pathname === link.toPath && "bg-primary-30"}
            `}>
              <IconDol
                library={(location.pathname === link.toPath) ? (!isEmpty(link.activeIcon) ? link.activeIcon.library : link.icon.library): link.icon.library}
                icon={(location.pathname === link.toPath) ? (!isEmpty(link.activeIcon) ? link.activeIcon.icon : link.icon.icon) : link.icon.icon}
                className={`
                  text-2xl mx-auto
                  ${location.pathname === link.toPath ? "text-primary" : "text-soft-dol"}
                `}
              />
            </div>
            <p className={`
              truncate text-sm 
              ${location.pathname === link.toPath ? "text-dol" : "text-soft-dol"}
            `}>
              {link.label}
            </p>
          </Link>
        ))
      )}
    </div>
  );
};

export default TabbarDol;
