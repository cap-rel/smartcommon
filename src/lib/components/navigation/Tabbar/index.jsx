import { defaultProps, propTypes } from "./props";
import { useStates, useVariantMerger } from "../../../hooks";
// import { Link } from "react-router-dom";
import { isNil, setGlobalVariables, setVariable } from "../../../utils";
import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, motion, scroll } from "framer-motion";

// TODO HideOnScroll
// TODO centralButton
// TODO badge for link
// TODO Fix label truncate not working

export const Tabbar = (props) => {
  const { variantProps, mergeProps, setParams } = useVariantMerger("Tabbar", props);

  const { 
    id,
    children,
    hideOnScroll = true
  } = variantProps;

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

  const variables = {
    "--tabbar-height": `${tabbarHeight}px`,
    "--tabbar-width": `${tabbarWidth}px`
  };

  useEffect(() => {
    setGlobalVariables(id, variables);
    setParams({ tabbarHeight, tabbarWidth });
  }, [tabbarHeight, tabbarWidth]);


  const [isOpen, setIsOpen] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const duration = 0.1;
  const goBackValue = 1/2;

  const openPosition = 0;
  const closedPosition = tabbarHeight || window.innerHeight;

  const tabbarPosition = isOpen ? openPosition : closedPosition;

  const y = useMotionValue(openPosition);

  useEffect(() => {
    if (!hideOnScroll) return;

    const scrollElement = document.querySelector("#Principal");

    const handleScroll = () => {
      const currentY = scrollElement.scrollTop;

      const delta = currentY - lastScrollY;

      const currentPosition = Math.max(openPosition, Math.min(closedPosition, y.get() + delta));

      y.set(currentPosition);

      setLastScrollY(currentY);
    };

    const handleScrollEnd = () => {
      if (isOpen) {
        if (y.get() > tabbarHeight * goBackValue) {
          setIsOpen(false);
        } else {
          animate(y, openPosition, { duration });
        }
      } else {
        if (y.get() > tabbarHeight * goBackValue) {
          animate(y, closedPosition, { duration });
        } else {
          setIsOpen(true);
        }
      }
      
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    scrollElement.addEventListener("touchend", handleScrollEnd);
    scrollElement.addEventListener("mouseup", handleScrollEnd);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      scrollElement.removeEventListener("touchend", handleScrollEnd);
      scrollElement.removeEventListener("mouseup", handleScrollEnd);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (!hideOnScroll) return;
    animate(y, tabbarPosition, { duration });
  }, [isOpen]);

  return (
    <motion.div { ...mergeProps("tabbar", props => ({
      ...props,
      ref: tabbarRef,
      style: { 
        y,
        ...variables
      },
      className: `shadow-xl shadow-black fixed right-0 bottom-0 left-0 z-10 bg-soft-bg flex justify-between items-center`
      // ${hidden ? "translate-y-full" : "translate-y-0"} duration-(--medium) 
    }))}>
      {children}
    </motion.div>
  );
};

Tabbar.propTypes = propTypes;
Tabbar.propTypes = defaultProps;