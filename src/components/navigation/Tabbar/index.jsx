import { tabbarPropTypes } from "./props";
import { mergeProps } from "../../../globals";
import { tabbarVariants } from "./variants";

// TODO HideOnScroll

export const Tabbar = ({
  // hideOnScroll = false,
  variant = "smart",
  tabbarProps,
  ...props
}) => {
  const tabbarPs = { ...props, ...tabbarProps };

  const { children } = tabbarPs;

  // const isScrollingDown = false;

  return (
    <div 
      { ...mergeProps(
        {}, `fixed right-0 bottom-0 left-0 z-10 bg-soft-bg row justify-between items-center`,
        tabbarPs, tabbarVariants, variant, "tabbarProps", {}
      )}
    >
      {children}
    </div>
  );
};

Tabbar.propTypes = tabbarPropTypes;

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