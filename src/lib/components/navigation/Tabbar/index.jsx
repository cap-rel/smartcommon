import { defaultProps, propTypes } from "./props";
import { useStates, useVariantMerger } from "../../../hooks";
// import { Link } from "react-router-dom";
import { isNil, setGlobalVariables, setVariable } from "../../../utils";
import { useEffect, useRef, useState } from "react";

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

  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const scrollElement = document.querySelector("#Principal");

    const handleScroll = () => {
      const currentY = scrollElement.scrollTop;

      if (currentY > lastScrollY && currentY > 200) {
        setHidden(true);
      } 
      else if (currentY < lastScrollY) {
        setHidden(false);
      }

      setLastScrollY(currentY);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div { ...mergeProps("tabbar", props => ({
      ...props,
      ref: tabbarRef,
      style: variables,
      className: `${hidden ? "translate-y-full" : "translate-y-0"} duration-(--medium) shadow-xl shadow-black h-50 fixed right-0 bottom-0 left-0 z-10 bg-red-500 flex justify-between items-center`
    }))}>
      {children}
    </div>
  );
};

Tabbar.propTypes = propTypes;
Tabbar.propTypes = defaultProps;