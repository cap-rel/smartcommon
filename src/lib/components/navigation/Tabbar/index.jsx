import { animate, useMotionValue, motion } from "framer-motion";
import { Children, Fragment, isValidElement, useEffect, useRef, useState } from "react";
import { isNil } from "lodash";

import { useStates, useVariantMerger } from "lib/hooks";
import { setGlobalVariables, navigatorInfo, applyFunctionIfNotNil, formatBadgeCount, BADGE_CLASS_NAME } from "lib/utils";

import { defaultProps, propTypes } from "./props";

// Tabs passed inside a fragment (<><TabbarItem/>...</>) count one by one,
// so the central button lands between them and not after the fragment.
const flattenChildren = (children) => Children.toArray(children).flatMap((child) => (
  isValidElement(child) && child.type === Fragment ? flattenChildren(child.props.children) : [child]
));
// TODO Fix label truncate not working

export const Tabbar = (props) => {
  const { variantProps, mergeProps, setParams } = useVariantMerger("Tabbar", props);

  const { 
    id,
    children,
    responsive = true,
    hideOnScroll = true,
    centralButton
  } = variantProps;

  const tabbarRef = useRef();

  const initialStates = {
    tabbarHeight: 0,
    tabbarWidth: 0
  };

  const { states, set } = useStates({ initialStates, debug: false });

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

  // Update global CSS variables when tabbar dimensions change
  useEffect(() => {
    setGlobalVariables(id, variables);
    setParams({ tabbarHeight, tabbarWidth });
  }, [id, tabbarHeight, tabbarWidth, setParams]);

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

  // Handle scroll-based hide/show animation
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

  // Animate tabbar position when open state changes
  useEffect(() => {
    if (!hideOnScroll || isDesktop) { return; }
    animate(y, tabbarPosition, { duration });
  }, [isOpen]);

  // Central action button (raised round button in the middle of the bar on
  // mobile, a full-width button in the desktop side menu). Its label is the
  // accessible name: on mobile only the icon shows.
  const renderCentralButton = () => {
    const { icon: centralIcon, label: centralLabel, onClick: centralOnClick, badge: centralBadge, disabled: centralDisabled = false } = centralButton;
    const centralBadgeText = formatBadgeCount(centralBadge);

    return (
      <div key="tabbar-central-button" { ...mergeProps("centralButtonContainer", props => ({
        ...props,
        className: `flex-1 flex justify-center ${responsive ? "lg:flex-0 lg:w-full" : ""}`
      }))}>
        <button { ...mergeProps("centralButton", props => ({
          ...props,
          type: "button",
          "aria-label": centralLabel,
          disabled: centralDisabled,
          "data-tabbar-central": "true",
          onClick: e => {
            applyFunctionIfNotNil(props.onClick, e);
            applyFunctionIfNotNil(centralOnClick, e);
          },
          className: `
            relative -translate-y-1/3 w-14 h-14 rounded-full bg-primary text-white text-app-2xl
            flex justify-center items-center gap-app-xs shadow-lg ring-4 ring-soft-bg
            not-disabled:active:brightness-soft disabled:brightness-soft cursor-pointer disabled:cursor-default
            ${responsive ? "lg:translate-y-0 lg:w-full lg:h-auto lg:rounded-app-md lg:py-app-xs lg:text-app-base lg:ring-0 lg:shadow-none" : ""}
          `
        }))}>
          {typeof centralIcon === "function" ? centralIcon() : centralIcon}
          {!isNil(centralLabel) && responsive &&
            <span { ...mergeProps("centralButtonLabel", props => ({
              ...props,
              "aria-hidden": "true",
              className: `hidden lg:inline font-app-semibold`
            }))}>
              {centralLabel}
            </span>
          }
          {centralBadgeText !== null &&
            <span { ...mergeProps("centralButtonBadge", props => ({
              ...props,
              "data-testid": "badge",
              className: BADGE_CLASS_NAME
            }))}>
              {centralBadgeText}
            </span>
          }
        </button>
      </div>
    );
  };

  const items = flattenChildren(children);
  const content = isNil(centralButton)
    ? children
    : [
      ...items.slice(0, Math.ceil(items.length / 2)),
      renderCentralButton(),
      ...items.slice(Math.ceil(items.length / 2)),
    ];

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
        ${responsive ? "lg:top-0 lg:right-auto lg:w-50 lg:flex-col lg:justify-start lg:items-start lg:px-app-base lg:py-app-xl lg:gap-app-xs lg:shadow-black/10" : ""}
      `
      // ${hidden ? "translate-y-full" : "translate-y-0"} duration-(--medium) 
    }))}>
      {content}
    </motion.div>
  );
};

Tabbar.propTypes = propTypes;
Tabbar.defaultProps = defaultProps;