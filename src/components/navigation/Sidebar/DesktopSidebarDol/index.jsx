import { useEffect } from "react";
import { isEmpty, sortArray } from "../../../../../globals/functions";
import { useLocation } from "react-router-dom";
import { setIsSidebarOpened } from "../../../../../reduxStore/reducers/settingsSlice";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Icon, Img, Select, LazyLink } from "../../..";
import { useStates, useWindow } from "../../../../hooks";

export const DesktopSidebar = (props) => {
  const { config } = props;

  const { darkMode } = useWindow();

  const navigation = config.app.navigation.desktop;
  // const linksGroups = sortArray(config.objects, "position").map(object => )
  
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
      links: sortArray(config.objects, "position").map(object => object.visibilityOnDevices.desktop && ({
        label: object.pluralLabel,
        toPath: `/${object.slug}`,
        colors: object.colors,
        icon: object.icon,
        activeIcon: object.activeIcon
      }))
    },
  ]

  // const linkGroups = [];

  const location        = useLocation();
  const dispatch        = useDispatch();
  const isSidebarOpened = useSelector(state => state.settings.isSidebarOpened);

  const { states, set } = useStates({
    isProfileOpened: false,
    isOnSidebar    : false,
    isLinkClicked  : false
  });

  useEffect(() => {
    if (states.isLinkClicked) {
      setTimeout(() => {
        set("isLinkClicked", false);
      }, 300);
    }
  }, [states.isLinkClicked]);

  return (
  <><div 
          className={`
            fixed top-0 bottom-0 z-40 col shadow-2xl bg-dark duration-300 border-dark-border
            ${(states.isOnSidebar || isSidebarOpened) 
              ? `w-72 ${navigation === "right-sidebar" && "border-l"} ${navigation === "left-sidebar" && "border-r"}` 
              : "w-18"}
            ${navigation === "right-sidebar" ? "right-0" : (navigation === "left-sidebar" ? "left-0" : "hidden")}
          `}
        >
          <div className={`col h-full`}>
            <div className={`row-between-center gap-2 p-4 text-dark-text`}>
            <button 
                className={`relative text-2xl p-2 rounded-md bg-dark button-dark-dol`}
                onMouseOver={() => set("isOnSidebar", false)}
                onClick={() => {
                  if (isSidebarOpened) {
                    set("isLinkClicked", true);
                    set("isOnSidebar", false);
                  }
                  dispatch(setIsSidebarOpened());
                }}
              >
                <Icon
                  library={isSidebarOpened ? "io5" : "io5"}
                  icon={isSidebarOpened ? "IoCloseSharp" : "IoMenuSharp"}
                  className={`duration-300 ${(states.isOnSidebar || isSidebarOpened) ? "text-primary" : "text-dark-text"}`}
                />
              </button>
              <div 
                className={`
                  row-v-center duration-200
                  ${(states.isOnSidebar || isSidebarOpened) ? "gap-2 mr-1" : "mr-0"}
                `}
              >
                {/* <div className={`bg-white rounded-full duration-200 ${(states.isOnSidebar || isSidebarOpened) && "p-1"}`}>
                  <Img
                    src={darkMode ? (config.appDarkIcon || config.appIcon) : config.appIcon}
                    className={`duration-200 ${(states.isOnSidebar || isSidebarOpened) ? "w-6" : "w-0"}`}
                  />
                </div> */}
                  <p 
                    className={`
                      italic duration-200 font-extrabold whitespace-nowrap
                      ${(states.isOnSidebar || isSidebarOpened) ? "text-xl opacity-100" : "text-[0] opacity-0"}
                    `}
                  >
                    {config.app.name}
                  </p>
              </div>
            </div>
            <div className={`h-[1px] bg-gradient-to-r from-primary to-secondary`}/>
            <div 
              className={`col gap-4 px-4 py-6 flex-grow`}
              onMouseOver={() => {
                if (!states.isLinkClicked) {
                  set("isOnSidebar", true)
                }
              }}
              onMouseOut={() => set("isOnSidebar", false)}
            >
              {linkGroups.map((linkGroup, LGI) => 
                <div 
                  key={LGI} 
                  className={`col gap-4`}
                >
                  <div className={`
                    relative row-v-center duration-200 h-6
                    ${(states.isOnSidebar || isSidebarOpened) && "gap-2 ml-2"}
                  `}>
                    <Icon
                      library={linkGroup.icon.library}
                      icon={linkGroup.icon.icon}
                      className={`
                        duration-200
                        ${(states.isOnSidebar || isSidebarOpened)
                          ? "text-dark-text"
                          : "absolute-full-center text-dark-border text-xl px-1 bg-dark"
                        }
                      `}
                    />
                    <p className={`
                      text-dark-text font-bold uppercase duration-200 
                      ${(states.isOnSidebar || isSidebarOpened) ? "text-opacity-100 text-base" : "text-[0] text-opacity-0"}
                      `}>
                      {linkGroup.title}
                    </p>
                    <div className={
                      `h-[1px] flex-grow
                      ${(states.isOnSidebar || isSidebarOpened) ? "bg-transparent" : "bg-dark-border flex-grow duration-200"}
                    `}/>
                  </div>
                  <div className="col gap-2">
                    {!isEmpty(linkGroup.links) && linkGroup.links.map((link, LI) => 
                      !isEmpty(link.label) &&
                      <LazyLink
                        key={LI}
                        lazyTo={link.toPath}
                        onClick={() => {
                          if (location.pathname !== link.toPath) {
                            set("isLinkClicked", true);
                            set("isOnSidebar", false);
                          }
                        }}
                        duration={300}
                        // ${(!isEmpty(linkGroup.title) && (states.isOnSidebar || isSidebarOpened)) && "ml-2"}
                        className={`
                          row-between-center relative rounded-md p-2 duration-200
                          ${(states.isOnSidebar || isSidebarOpened) && "gap-2"}
                          ${(location.pathname === link.toPath && !states.isProfileOpened) 
                            ? "text-white bg-gradient-to-r from-primary to-secondary" 
                            : "bg-dark text-dark-soft-text button-dark-dol"
                          }
                        `}
                      >
                        <div className="row-v-center gap-2 relative">
                          <Icon
                            library={(location.pathname === link.toPath && !states.isProfileOpened) ? (!isEmpty(link.activeIcon) ? link.activeIcon.library : link.icon.library): link.icon.library}
                            icon={(location.pathname === link.toPath && !states.isProfileOpened) ? (!isEmpty(link.activeIcon) ? link.activeIcon.icon : link.icon.icon) : link.icon.icon}
                            className={`text-2xl ${location.pathname !== link.toPath && "text-primary"}`}
                            // style={{ fill: location.pathname !== link.toPath && "url(#gradientSvg)" }}                    
                          />
                          <span 
                            className={`${(states.isOnSidebar || isSidebarOpened) ? "text-sm opacity-100" : "text-[0] opacity-0"}`}
                            style={{ transition: 'opacity 200ms, font-size 200ms' }}
                          >
                            {link.label}
                          </span>
                        </div>
{/* 
                          {LI == 2 &&
                        <span 
                          className={
                            `relative py-0.5 px-1.5 text-[#3f51b5] border border-[#3f51b5] bg-white rounded-full duration-200
                            ${(states.isOnSidebar || isSidebarOpened) ? "text-xs opacity-100" : "text-[0] opacity-0"}
                          `}
                        >
                          10
                        </span>} */}
                        
                      </LazyLink>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={`h-[1px] bg-gradient-to-r from-primary to-secondary`}/>
            <div 
              className={`relative row-between-center gap-2 p-4 text-dark-text`}
              onMouseOver={() => {
                if (!states.isLinkClicked) {
                  set("isOnSidebar", true)
                }
              }}
              onMouseOut={() => set("isOnSidebar", false)}
            >
            <button 
              className={`
                text-2xl p-2 rounded-md bg-dark button-dark-dol row-v-center
                ${(states.isOnSidebar || isSidebarOpened) ? "gap-2" : "gap-0"}
              `}
              onClick={() => {
                // if (location.pathname !== link.toPath) {
                  set("isLinkClicked", true);
                  set("isOnSidebar", false);
                  set("isProfileOpened", true);
                // }
              }}
            >
                {/* <Icon
                  library={`fa6`}
                  icon={`FaRegUser`}
                  className={`relative`}
                /> */}
                <Img
                  src={`/images/profile.png`}
                  round={true}
                  className={`size-6`}
                />
                  <p
                    className={`
                      duration-200 font-semibold max-h-6 whitespace-nowrap
                      ${(states.isOnSidebar || isSidebarOpened) ? "opacity-100 text-xs" : "text-[0] opacity-0"}
                    `}
                  >
                  PAOLO DEBAISIEUX
                </p>
              </button>
              <button 
              className={`
                text-dark-text rounded-md bg-dark button-dark-dol
                ${(states.isOnSidebar || isSidebarOpened) ? "p-2 bg-dark" : "p-0 bg-dark-0"}
              `}
              style={{ transition: "background-color 300ms"}}
              >
                {/* // TODO Régler le problème du padding (pas de duration donc une petite bnourl) */}
                  <Icon
                    library={`fa6`}
                    icon={`FaGear`}
                    className={`
                      duration-300
                      ${(states.isOnSidebar || isSidebarOpened) ? "text-secondary size-6 opacity-100" : "text-dark-text size-0 opacity-0"}
                    `}
                  />
              </button>
            </div>
          </div>
        </div>
        <Alert
          isOpened={states.isProfileOpened}
          setIsOpened={(newState) => set("isProfileOpened", newState)}
          className={`col-h-center gap-4 p-4 text-base bg-dol rounded-md`}
        >
          <button 
            className={`
               absolute right-2 top-2 text-2xl p-2 bg-dol text-soft-dol button-dol rounded-full
            `}
            onClick={() => set("isProfileOpened", false)}
          >
            <Icon
              library={"io5"}
              icon={"IoCloseSharp"}
            />
          </button>
          <div className="col-h-center gap-2">
            <Img
              src={`/images/profile.png`}
              round={true}
              className={`h-24 w-24`}
            />
            <p className={`uppercase text-dol font-bold text-2xl`}>Paolo Debaisieux</p>
            <p className="italic -mt-2 underline text-soft-dol text-lg">paolo.debaisieux@cap-rel.fr</p>
          </div>
          <div className="col gap-2">
            <div className="col gap-2 border border-dol w-full text-gray-800 rounded-md">
            <p 
              className="
                text-xl text-center py-2 text-dol rounded-t-lg
                border-b border-dol bg-soft-dol font-semibold"
            >
              Session (SmartAuth)
            </p>
              <div className="row-v-center h-full px-4 py-2 w-full divide-x divide-dol">
                  <span className="basis-1/2 text-soft-dol pr-4">Durée de la connexion</span>
                  <span className="basis-1/2 text-dol pl-4">1 h 35 min</span>
              </div>
              <div className="row-v-center h-full px-4 py-2 w-full divide-x divide-dol bg-soft-dol">
                  <span className="basis-1/2 text-soft-dol pr-4">Connecté depuis</span>
                  <span className="basis-1/2 text-dol pl-4">10/08/2019 18:57</span>
              </div>
              <div className="row-v-center h-full px-4 py-2 w-full divide-x divide-dol">
                  <span className="basis-1/2 text-soft-dol pr-4">Connexion précédente</span>
                  <span className="basis-1/2 text-dol pl-4">10/06/2024 12:35</span>
              </div>
            </div>
          </div>
          <div className="row-between-center gap-4 w-full">
            <button 
              className={`
                row-v-center py-2 gap-2 px-4 text-white button-dark-dol 
                rounded-md bg-[#253c5c] border-[#253c5c] font-semibold
              `}
              onClick={() => set("isProfileOpened", false)}
            >
              <div className="avatar w-6">
                <div className="rounded-full relative">
                  <img src="/images/dolibarr.jpeg" alt="" />
                </div>
              </div>
              <p>Dolibarr</p>
            </button>
            <button 
              className={`
                row-v-center gap-2 py-2 px-4 bg-red-500 button-dark-dol 
                rounded-md text-white font-semibold
              `}
              onClick={() => set("isProfileOpened", false)}
            >
              <Icon
                library={"io5"}
                icon={"IoLogOut"}
                className={`text-xl`}
              />
              <p>Déconnexion</p>
            </button>
          </div>
        </Alert>
        </>
  );
};
