import { Icon, Img } from "../../others";
import { useNavigator, useWindow } from "../../../hooks";
import { title } from "@uiw/react-md-editor";
import { hexToRgb, isEmpty } from "../../../globals/functions";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export const PublicLayout = (props) => {
  const { config } = props;

  const icon = config.app.icon;
  const darkIcon = config.app.darkIcon;
  const img = config.app.img;

  const { darkMode } = useWindow();
  
  return (
    <div className="min-h-screen relative bg-gradient-to-r from-light-60 dark:from-dark-60 via-primary-60 dark:via-primary-60 to-light-60 dark:to-dark-60"
      // style={{ backgroundImage: `linear-gradient(to right, rgb(${hexToRgb(!darkMode ? "#ffffff" : "#0f172a")}, 0.7), rgb(${hexToRgb(primaryColor)}, 0.7), rgb(${hexToRgb(!darkMode ? "#ffffff" : "#0f172a")}, 0.7))` }}
    >
      <div className="hidden z-10 sm:block absolute blur-3xl rounded-full bg-secondary-60 right-40 top-60 h-80 w-80" />
      <div className="hidden z-10 sm:block absolute blur-3xl rounded-full bg-secondary-60 left-100 top-128 h-60 w-60" />
      <div className="hidden z-10 sm:block absolute blur-3xl rounded-full bg-secondary-60 left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-240 w-240" />

      <div className={`relative z-20 min-h-screen col-full-center`}>
        <div className={`
          col relative bg-light dark:bg-dark gap-6 min-h-screen w-full
          sm:p-6 sm:w-auto sm:min-h-0 sm:rounded-md sm:shadow-2xl
          lg:w-240 lg:row-v-center
        `}>
          <div className={`
            relative col-full-center gap-3 w-full h-44
            lg:w-1/2 lg:min-h-140
          `}>
            {!isEmpty(img)
              ? <Img
                  src={!isEmpty(img) ? img : "/images/default-img.avif"}
                  className={`absolute inset-0`}
                  position={`cover`}
                />
              : <div className={`absolute inset-0 bg-primary`} />
            }
            <div className={`relative h-full w-full bg-gradient-to-t from-black/80 ${isEmpty(img) && "via-transparent"} to-transparent`}>
              <div className={`
                absolute -bottom-9 left-6
                lg:text-white lg:p-6 lg:absolute-full-center lg:w-full lg:col-v-center lg:gap-6
              `}>
                {
                  typeof icon === "object"
                    ? <Icon
                        library={darkMode ? (darkIcon.library || icon.library) : icon.library}
                        icon={darkMode ? (darkIcon.icon || icon.icon) : icon.icon}
                        className={`text-primary`}
                      />
                    : <div className={`bg-dol lg:bg-light rounded-full p-2 self-start`}>
                        <Img
                          src={darkMode ? (darkIcon || icon) : icon}
                          className={`w-14 lg:w-20`}
                        />
                      </div>
                }
                <p className={`
                  hidden
                  lg:text-5xl lg:block lg:font-extrabold lg:italic
                `}>
                  {config.app.name}
                </p>
                <p className={`
                  hidden 
                  lg:text-xl lg:block
                `}>
                  {config.app.description}
                </p>
              </div>
            </div>
          </div>
          <div className={`
            hidden dark:bg-gradient-to-b from-primary to-secondary
            lg:block lg:w-[2px] lg:min-h-140 lg:bg-light-border
          `}/>
          <div className={`
            p-6 col gap-6
            sm:w-100 sm:p-0
            lg:w-1/2
          `}>
            <div className={`
              col gap-3
              lg:hidden 
            `}>
              <p className={`
                text-3xl font-extrabold italic
                sm:mt-3
              `}>
                {config.app.name}
              </p>
              <p className={`text-soft-dol`}>
                {config.app.description}
              </p>
            </div>
            <hr className={`lg:hidden`}/>
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
};