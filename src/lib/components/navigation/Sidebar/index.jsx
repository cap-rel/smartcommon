import { IoCloseSharp, IoMenuSharp } from "react-icons/io5";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { Panel, Button } from "lib/components";

import { propTypes } from "./props";

// TODO badge for link
// TODO hideButtonOnScroll
// TODO duration
// TODO button position with app variables
// TODO global variables
// TODO id automatique dans le useVariantMerger

const Link = () => {
  return null;
}

export const Sidebar = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("Sidebar", props);

  const { id, toggleButton, links = [], open, duration = 300, children, Panel: PanelProps = {} } = variantProps;

  const { isOpen, close, id: panelId } = PanelProps;

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
          const { badge, icon, activeIcon, disabled, label, active: activeManually, onClick = () => {} } = link;
        
          const { to } = link;
      
          const active = !isNil(activeManually) ? activeManually : `${location.pathname}${location.search}` === to;
          const currentIcon = active ? (!isNil(activeIcon) ? activeIcon : icon) : icon;
  
          return (
            <Link key={`link${LI}`} { ...mergeProps("link", props => ({
              ...props,
              ...link,
              onClick: e => {
                onClick(e);
                close();
              },
              className: `bg-soft-bg py-app-sm px-app-md ${disabled ? "pointer-events-none" : "active:brightness-soft"}`
            }))}>

              <div { ...mergeProps("iconAndLabelContainer", props => ({
                ...props,
                className: `flex flex-col items-center gap-app-xxs`
              }))}>

                {!isNil(icon) && 
                  <div { ...mergeProps("icon", props => ({
                    ...props,
                    className: `bg-primary text-white text-app-2xl p-app-base rounded-app-md`
                  }))}>
                    {currentIcon}
                  </div>
                }

                {!isNil(label) &&
                  <div { ...mergeProps("label", props => ({
                    ...props,
                    className: `text-app-sm text-soft-text`
                  }))}>
                    {label}
                  </div>
                }
                
              </div>
            </Link>
          );
        })}

        {children}

        {toggleButton &&
          <Button { ...mergeProps("Button", props => ({
            id: ButtonId,
            icon: isOpen ? IoCloseSharp : IoMenuSharp,
            ...props,
            buttonProps: {
              ...props.buttonProps,
              onClick: e => {
                props.buttonProps?.onClick(e);
                if (isOpen) {
                  close();
                } else {
                  open();
                }
              },
              className: `px-app-base py-app-base text-app-lg absolute bottom-app-base shadow-md rounded-app-xl -right-17`
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