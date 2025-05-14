import { propTypes } from "./props";
import { useStates, useVariantToProps } from "../../../hooks";
import { Link, useLocation } from "react-router-dom";
import { isNil } from "../../../globals";
import { useEffect, useRef } from "react";

// TODO HideOnScroll
// TODO centralButton
// TODO badge for link
// TODO Fix label truncate not working

export const Tabbar = (props) => {
  const { variantProps, mergeProps, setParams } = useVariantToProps("tabbar", props);

  const { links = [], id, children } = variantProps;

  const location = useLocation();

  const tabbarRef = useRef();

  const { states, set } = useStates({
    tabbarHeight: 0,
    tabbarWidth: 0
  });

  const { tabbarHeight, tabbarWidth } = states;

  useEffect(() => {
    if (tabbarRef.current) {
      set("tabbarHeight", tabbarRef.current.offsetHeight);
      set("tabbarWidth", tabbarRef.current.offsetWidth);
    }
  }, []);

  const globalVariables = {
    [`--${id}-tabbar-height`]: `${tabbarHeight}px`,
    [`--${id}-tabbar-width`]: `${tabbarWidth}px`
  };

  const variables = {
    [`--tabbar-height`]: `${tabbarHeight}px`,
    [`--tabbar-width`]: `${tabbarWidth}px`
  };

  useEffect(() => {
    setParams({ tabbarHeight, tabbarWidth });
  }, [tabbarHeight, tabbarWidth]);

  return (
    <div { ...mergeProps("tabbar", props => ({
      ...props,
      ref: tabbarRef,
      style: variables,
      className: `shadow-xl shadow-black fixed right-0 bottom-0 left-0 z-10 bg-soft-bg flex justify-between items-center`
    }))}>

      {links.map((link, LI) => {
        const { badge, icon, activeIcon, disabled, label, active: activeManually } = link;
      
        const { to } = link;
    
        const active = !isNil(activeManually) ? activeManually : `${location.pathname}${location.search}` === to;
        const currentIcon = active ? (!isNil(activeIcon) ? activeIcon : icon) : icon;

        return (
          <Link key={`link${LI}`} { ...mergeProps("link", props => ({
            ...props,
            ...link,
            className: `flex-1 py-app-xs ${disabled && "pointer-events-none"}`
          }))}>

            <div { ...mergeProps("iconAndLabelContainer", props => ({
              ...props,
              className: `flex flex-col items-center gap-app-xxs`
            }))}>

              {!isNil(icon) && 
                <div { ...mergeProps("icon", props => ({
                  ...props,
                  className: `text-lg flex justify-center items-center py-app-xs px-app-md rounded-app-xl ${active ? "text-primary  bg-primary/20" : "text-soft-text"}`
                }))}>
                  {currentIcon}
                </div>
              }

              {!isNil(label) &&
                <div { ...mergeProps("label", props => ({
                  ...props,
                  className: `truncate text-app-xs ${active ? "text-primary" : "text-soft-text"}`
                }))}>
                  {label}
                </div>
              }

            </div>

          </Link>
        );
      })}

      {children}

    </div>
  );
};

Tabbar.propTypes = propTypes;

// Revenir par default
// Montrer le code et le copier
// Choisir les props
// Choisir les variantes
// styliser (style, className) avec les paramètres

// import { useEffect, useState } from "react";

// export default function ScrollListener() {
//   const [scrollDirection, setScrollDirection] = useState(null);

//   useEffect(() => {
//     let lastScrollY = window.scrollY;

//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
//       if (currentScrollY > lastScrollY) {
//         setScrollDirection("down");
//       } else if (currentScrollY < lastScrollY) {
//         setScrollDirection("up");
//       }
//       lastScrollY = currentScrollY;
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   return (
//     <div className="h-[200vh] flex flex-col items-center justify-center">
//       <p className="text-2xl font-bold">
//         Scroll vers le {scrollDirection ? scrollDirection : "attente..."}
//       </p>
//     </div>
//   );
// }