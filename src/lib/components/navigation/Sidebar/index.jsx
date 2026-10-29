import { useEffect, useRef, useState } from "react";
import { IoCloseSharp, IoMenuSharp } from "react-icons/io5";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { Panel, Button, LazyLink } from "lib/components";
import { applyFunctionIfNotNil, formatBadgeCount, BADGE_CLASS_NAME } from "lib/utils";

import { propTypes } from "./props";

// TODO duration
// TODO button position with app variables
// TODO global variables
// TODO id automatique dans le useVariantMerger

// Scroll distance (px) a gesture must cover before the toggle button hides
// or comes back: small jitters keep the current state.
const SCROLL_THRESHOLD = 8;

const scrollTopOf = (target) => (
  target === document || target === document.documentElement
    ? (document.scrollingElement?.scrollTop ?? window.scrollY)
    : (target?.scrollTop ?? 0)
);

// A link with `to` navigates through the router (LazyLink); without `to`
// it is a plain button driven by its onClick.
const SidebarLink = ({ to, children, ...elementProps }) => (
  isNil(to)
    ? <button type="button" { ...elementProps }>{children}</button>
    : <LazyLink to={to} Link={elementProps}>{children}</LazyLink>
);

export const Sidebar = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("Sidebar", props);

  const { id, toggleButton, hideButtonOnScroll = false, links = [], open, duration = 300, children, Panel: PanelProps = {} } = variantProps;

  const { isOpen, close, id: panelId } = PanelProps;

  // hideButtonOnScroll: the toggle button slides away while the content
  // scrolls down and comes back as soon as it scrolls up. The scrolling
  // element is not known in advance (a Page, the document...), so scroll
  // events are observed in the capture phase on the document: scroll does
  // not bubble, capture still sees it, and nothing global is modified.
  const [isButtonHidden, setIsButtonHidden] = useState(false);
  const lastScrollTops = useRef(new WeakMap());

  useEffect(() => {
    if (!hideButtonOnScroll || !toggleButton || isOpen) {
      setIsButtonHidden(false);
      return undefined;
    }

    const handleScroll = (e) => {
      const target = e.target;
      const key = target === document || target === document.documentElement ? document : target;
      if (!key || typeof key !== "object") return;

      const current = scrollTopOf(key);
      const previous = lastScrollTops.current.get(key) ?? 0;
      const delta = current - previous;
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      lastScrollTops.current.set(key, current);
      setIsButtonHidden(delta > 0 && current > 0);
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [hideButtonOnScroll, toggleButton, isOpen]);

  const PanelId = !isNil(panelId) ? panelId : `${id}-Panel`;
  const ButtonId = !isNil(panelId) ? panelId : `${id}-Button`;

  return (
      <Panel { ...mergeProps("Panel", props => ({
        id: PanelId,
        ...props,
        panelProps: {
          ...props.panelProps,
          className: `top-0 right-auto translate-y-0 max-h-auto rounded-none rounded-r-app-base py-app-xs px-0 gap-0 ${isOpen ? "translate-x-0" : `-translate-x-full`}`
        },
        // Overlay: {
        //   overlayProps: { className: "z-100" }
        // }
      }))}>

        {(links ?? []).map((link, LI) => {
          const { to, icon, activeIcon, disabled, label, badge, active: activeManually, onClick } = link;

          const active = !isNil(activeManually) ? activeManually : `${location.pathname}${location.search}` === to;
          const currentIcon = active ? (!isNil(activeIcon) ? activeIcon : icon) : icon;

          // Counter badge, pinned to the icon (or to the link when it has
          // none): hidden for 0 / empty, capped at "99+".
          const badgeText = formatBadgeCount(badge);
          const badgeElement = badgeText !== null && (
            <span { ...mergeProps("badge", props => ({
              ...props,
              "data-testid": "badge",
              className: BADGE_CLASS_NAME
            }))}>
              {badgeText}
            </span>
          );

          return (
            <SidebarLink key={`link${LI}`} to={to} { ...mergeProps("link", props => ({
              ...props,
              "aria-current": active ? "page" : undefined,
              "aria-disabled": disabled ? "true" : undefined,
              onClick: e => {
                applyFunctionIfNotNil(props.onClick, e);
                applyFunctionIfNotNil(onClick, e);
                // close comes from the Panel slot: absent when the Sidebar
                // is not driven by a Panel state.
                applyFunctionIfNotNil(close);
              },
              className: `block w-full bg-soft-bg py-app-sm px-app-md ${disabled ? "pointer-events-none" : "active:brightness-soft cursor-pointer"}`
            }))}>

              <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `relative flex flex-col items-center gap-app-xxs`
              }))}>

                {!isNil(icon) && 
                  <div { ...mergeProps("icon", props => ({
                    ...props,
                    className: `relative bg-primary text-white text-app-2xl p-app-base rounded-app-md`
                  }))}>
                    {typeof currentIcon === "function" ? currentIcon() : currentIcon}
                    {badgeElement}
                  </div>
                }

                {isNil(icon) && badgeElement}

                {!isNil(label) &&
                  <div { ...mergeProps("label", props => ({
                    ...props,
                    className: `text-app-sm text-soft-text`
                  }))}>
                    {label}
                  </div>
                }
                
              </div>
            </SidebarLink>
          );
        })}

        {children}

        {toggleButton &&
          <Button { ...mergeProps("Button", props => ({
            id: ButtonId,
            icon: isOpen ? IoCloseSharp : IoMenuSharp,
            ...props,
            // Top-level onClick: Button replaces buttonProps.onClick with its
            // own handler, which only calls this prop.
            onClick: e => {
              applyFunctionIfNotNil(props.onClick, e);
              applyFunctionIfNotNil(isOpen ? close : open);
            },
            buttonProps: {
              ...props.buttonProps,
              // A hidden button leaves the tab order and the accessibility tree.
              "aria-hidden": isButtonHidden ? "true" : undefined,
              tabIndex: isButtonHidden ? -1 : undefined,
              "data-sidebar-toggle": "true",
              "data-hidden": isButtonHidden ? "true" : undefined,
              className: `px-app-base py-app-base text-app-lg absolute bottom-app-base shadow-md rounded-app-xl -right-17 transition-all duration-300 ${isButtonHidden ? "opacity-0 translate-y-4 pointer-events-none" : ""}`
            },
          }))} />
        }


      </Panel> 

  );
};

//  <LazyLink { ...mergeProps("LazyLink", props => ({
//             ...props,
//             Link: {
//                 ...props.Link,
//                 onClick: closeSidebar,
//             }
//         }))}>
//             <Button { ...mergeProps("Button", props => ({
//                 ...props,
//                 buttonProps: { 
//                     ...props.buttonProps,
//                     className: `gap-app-xxs w-full flex-col justify-center bg-soft-bg rounded-app-base`
//                 },
//                 iconProps: {
//                     ...props.iconProps,
//                     className: `bg-primary rounded-app-md p-app-base text-3xl`
//                 },
//                 textProps: { 
//                     ...props.textProps,
//                     className: `text-app-sm text-soft-text`
//                 }
//             }))} />
//         </LazyLink>

Sidebar.propTypes = propTypes;

{/* <Overlay
        isOpen={isOpen}
        close={() => set("isOpen", false)}
      />
      <div
        { ...sidebarPs}
        style={{ "--transitionTimer": "300ms", ...sidebarPs?.style }}
        className={twMerge(`fixed flex flex-col top-0 bottom-0 z-50 py-4 w-32 duration-(--transitionDuration) bg-soft-bg ${positionClass}`, sidebarPs?.className)}
      >
        {children}
        {floatingButton &&
          <Button 
            icon={isOpen ? <IoCloseSharp /> : <IoMenuSharp />}
            buttonProps={{
              onClick: () => set("isOpen", !isOpen),
              className: twMerge(`z-50 p-4 text-xl absolute bottom-4 shadow-md rounded-full ${position === "right" ? "-left-14" : "-right-15"}`, buttonProps?.className)
            }}
            iconsProps={{
              className: ""
            }}
          />
        }
      // </div> */}