import { useEffect, useState } from "react";
import { isEmpty, sortArray } from "../../../../../globals/functions";
import { useLocation } from "react-router-dom";
import { useNavigator, useStates, useWindow } from "../../../../hooks";
import { IconDol, ImgDol, AlertDol, SelectDol, LazyLinkDol } from "../../../../dol";

const MobileSidebarDol = (props) => {
  const { config } = props;
  const navigation = config.navigation;

  const location = useLocation();

  const { darkMode } = useNavigator();

  const { states, set } = useStates({
    isOpened: false,
    isNotOpened: true,
    isClickingLink: false,
  });

  useEffect(() => {
    if (states.isOpened) {
      set("isNotOpened", false);
    } else {
      setTimeout(() => {
        set("isNotOpened", true);
      }, 300);
    }
  }, [states.isOpened]);

  const dashBoardLinks = [
    {
      label: "Tableau de bord",
      toPath: "/",
      icon: { library: "fa6", icon: "FaCalendarDays" },
      activeIcon: { library: "fa6", icon: "FaRegCalendar" },
    }, 
    {
      label: "Agenda",
      toPath: "/agenda",
      icon: { library: "fa6", icon: "FaRegCalendar" },
      activeIcon: { library: "fa6", icon: "FaCalendarDays" },
    },
  ];

  const objetLinks = sortArray(config.objects, "position").map(object => object.visibilityOnDevices.desktop && ({
    label: object.pluralLabel,
    toPath: `/${object.slug}`,
    colors: object.colors,
    icon: object.icon,
    activeIcon: object.activeIcon
  }))

  const links = [...dashBoardLinks, ...objetLinks]

  useEffect(() => {
    if (states.isClickingLink) {
      setTimeout(() => {
        set("isClickingLink", false);
      }, 300);
    }
  }, [states.isClickingLink]);

  return (
    <div 
      className={`
        duration-300
        ${states.isOpened ? "alert-dol" : "fixed bottom-0 top-0 z-60"}
        ${states.isNotOpened ? `w-0 top-0 bottom-0` : `inset-0`}
        ${navigation === "right-sidebar" && "right-0"}
        ${navigation === "left-sidebar" && "left-0"}
      `}
      onClick={() => set("isOpened", false)}
    >
      <div 
        className={`
          duration-300 fixed top-0 bottom-0 col bg-dol text-dol py-4 h-full
          ${navigation === "right-sidebar" ? "right-0" : "left-0"}
          ${states.isOpened ? "translate-x-0" : (navigation === "right-sidebar" ? "translate-x-[calc(100%+1px)]" : "-translate-x-[calc(100%+1px)]")}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(links.map((link, LI) => 
          !isEmpty(link.label) && 
          <LazyLinkDol
            key={LI}
            lazyTo={link.toPath}
            onClick={() => set("isOpened", false)}
            duration={300}
            className={`
              relative col-full-center gap-2 px-6 py-3 duration-200 bg-dol button-dol
              ${location.pathname === link.toPath && "darken-bg-90"}
            `}
          >
            <span className={`p-4 relative text-3xl rounded-md text-white bg-primary border border-primary dark:bg-primary-20 dark:text-primary`}>
              <IconDol
                library={(location.pathname === link.toPath && link.activeIcon) ? link.activeIcon.library : link.icon.library}
                icon={(location.pathname === link.toPath && link.activeIcon) ? link.activeIcon.icon : link.icon.icon}
              />
            </span>
            <span className={`relative font-semibold text-sm text-soft-dol`}>
              {link.label}
            </span>
          </LazyLinkDol>
        ))}
        <button 
          className={`
            shadow-md button-dol absolute bottom-4 rounded-full text-3xl p-2 bg-primary text-white border border-primary dark:bg-primary-20 dark:text-primary
            ${navigation === "right-sidebar" ? "-left-11" : "-right-15"}
          `}
          onClick={() => set("isOpened", !states.isOpened)}
        >
          <IconDol
            library={states.isOpened ? "io5" : "io5"}
            icon={states.isOpened ? "IoCloseSharp" : "IoMenuSharp"}
            className={`mx-auto relative z-20`}
          />
          <div className={`absolute z-10 inset-0 bg-dol rounded-full`} />
        </button>
      </div>
    </div>
  );
};

export default MobileSidebarDol;
