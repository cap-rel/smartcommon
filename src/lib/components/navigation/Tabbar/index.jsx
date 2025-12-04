import { animate, useMotionValue, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useStates, useVariantMerger } from "lib/hooks";
import { setGlobalVariables, navigatorInfo } from "lib/utils";

import { defaultProps, propTypes } from "./props";

// TODO centralButton
// TODO badge for link
// TODO Fix label truncate not working

export const Tabbar = (props) => {
  const { variantProps, mergeProps, setParams } = useVariantMerger("Tabbar", props);

  const { 
    id,
    children,
    responsive = true,
    hideOnScroll = true
  } = variantProps;

  const tabbarRef = useRef();

  const initialStates = {
    tabbarHeight: 0,
    tabbarWidth: 0
  };

  const { states, set } = useStates({ initialStates });

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
  const openGoBackValue = 1/5;
  const closedGoBackValue = 4/5;

  const openPosition = 0;
  const closedPosition = tabbarHeight || window.innerHeight;

  const tabbarPosition = isOpen ? openPosition : closedPosition;

  const y = useMotionValue(openPosition);

  const isDesktop = navigatorInfo.device.type === "desktop";

  useEffect(() => {
    if (!hideOnScroll || isDesktop) { return; }

    const scrollElement = tabbarRef.current?.closest("[data-component='Page']");
    // const scrollElement = window;

    const handleScroll = () => {
      const currentY = scrollElement.scrollTop;

      const delta = currentY - lastScrollY;

      const currentPosition = Math.max(openPosition, Math.min(closedPosition, y.get() + delta));

      y.set(currentPosition);

      setLastScrollY(currentY);
    };

    const handleScrollEnd = () => {
      if (isOpen) {
        if (y.get() > tabbarHeight * openGoBackValue) {
          setIsOpen(false);
        } else {
          animate(y, openPosition, { duration });
        }
      } else {
        if (y.get() > tabbarHeight * closedGoBackValue) {
          animate(y, closedPosition, { duration });
        } else {
          setIsOpen(true);
        }
      }
      
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });
      scrollElement.addEventListener("touchend", handleScrollEnd);
      scrollElement.addEventListener("mouseup", handleScrollEnd);

      return () => {
        scrollElement.removeEventListener("scroll", handleScroll);
        scrollElement.removeEventListener("touchend", handleScrollEnd);
        scrollElement.removeEventListener("mouseup", handleScrollEnd);
      };
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (!hideOnScroll || isDesktop) { return; }
    animate(y, tabbarPosition, { duration });
  }, [isOpen]);

  return (
    <motion.div { ...mergeProps("tabbar", props => ({
      ...props,
      "data-component": "Tabbar",
      ref: tabbarRef,
      style: { 
        y,
        ...variables
      },
      className: `
        shadow-xl shadow-black fixed right-0 bottom-0 left-0 z-10 bg-soft-bg flex justify-between items-center
        ${responsive && "lg:top-0 lg:right-auto lg:w-50 lg:flex-col lg:justify-start lg:items-start lg:px-app-base lg:py-app-xl lg:gap-app-xs lg:shadow-black/10"}
      `
      // ${hidden ? "translate-y-full" : "translate-y-0"} duration-(--medium) 
    }))}>
      {children}
    </motion.div>
  );
};

Tabbar.propTypes = propTypes;
Tabbar.propTypes = defaultProps;