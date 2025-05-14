import { Overlay } from "../Overlay";
import { useStates, useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";
import { useEffect, useRef } from "react";

// TODO closeOnMove
// TODO z-index prop

// {
//     overlay = true,
//     shadow = false,
//     closeOnClickOverlay = true,
//     closeOnMove = false,
//     isOpen = false,
//     closePanel = () => {},
//     floating = false,
//     position = "left",
//     overlayProps,
//     panelProps,
//     iconProps,
//     ...props
// }

export const Panel = (props) => {
    const { variantProps, mergeProps, setParams } = useVariantToProps("Panel", props);

    const { 
        id,
        children,
        overlay = true,
        closeOnClickOverlay = true,
        closeOnMove,
        close,
        isOpen,
    } = variantProps;
    
    // const { states, set } = useStates({
    //     startTouch: null,
    //     moveTouch: null
    // })

    // const { startTouch, moveTouch } = states;

    // const moveMin = 30;
    
    // let positionClass;
    // let icon;
    // let cannotClose;
    // let client;

    // switch (position) {
    //     case "top"   : positionClass = `${isOpen ? "top-(--initial)" : "-top-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-b-xl"} fixed pb-10`;
    //                    icon = "absolute-h-center bottom-4 w-8 h-2";
    //                    cannotClose = moveTouch + moveMin < startTouch;
    //                    client = "clientY";
    //                    break;
    //     case "right" : positionClass = `${isOpen ? "right-(--initial)" : "-right-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-l-xl"} fixed pl-10`;
    //                    icon = "absolute-v-center left-4 h-8 w-2";
    //                    cannotClose = moveTouch - moveMin > startTouch;
    //                    client = "clientX";
    //                    break;
    //     case "bottom": positionClass = `${isOpen ? "bottom-(--initial)" : "-bottom-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-t-xl"} fixed pt-10`;
    //                    icon = "absolute-h-center top-4 w-8 h-2";
    //                    cannotClose = moveTouch - moveMin > startTouch;
    //                    client = "clientY";
    //                    break;
    //     default      : positionClass = `${isOpen ? "left-(--initial)" : "-left-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-r-xl"} fixed pr-10`;
    //                    icon = "absolute-v-center right-4 h-8 w-2";
    //                    cannotClose = moveTouch + moveMin < startTouch;
    //                    client = "clientX";
    //                    break;
    // }
   
    const panelRef = useRef();

    const { states, set } = useStates({
        panelHeight: 0,
        panelWidth: 0
    });

    const { panelHeight, panelWidth } = states;

    useEffect(() => {
        if (panelRef.current) {
            set("panelHeight", panelRef.current.offsetHeight);
            set("panelWidth", panelRef.current.offsetWidth);
        }
    }, []);

    // const globalVariables = {
    //     [`--${id}-panel-height`]: `${panelHeight}px`,
    //     [`--${id}-panel-width`]: `${panelWidth}px`
    // };

    const variables = {
        [`--panel-height`]: `${panelHeight}px`,
        [`--panel-width`]: `${panelWidth}px`
    };

    useEffect(() => {
        setParams({ panelHeight, panelWidth });
    }, [panelHeight, panelWidth]);

    return (
        <>
            {overlay &&
                <Overlay { ...mergeProps("Overlay", props => ({
                    ...props,
                    isOpen,
                    close: closeOnClickOverlay && close
                }))} />
            }
            <div { ...mergeProps("panel", props => ({
                ...props,
                ref: panelRef,
                style: variables,
                className: `rounded-t-app-lg fixed left-0 right-0 bottom-0 z-50 p-app-base
                gap-app-base flex flex-col duration-(--medium) bg-soft-bg max-h-4/5
                ${isOpen ? "translate-y-0" : "translate-y-full"}`
            }))}>
                {children}
            </div>
        </>
    );
};

Panel.prototypes = propTypes;

{/* <Overlay 
    { ...overlayProps}
    isOpen={isOpen} 
    closeOverlay={closeOnClickOverlay && closePanel} 
/>
<div
    { ...panelPs}
    style={{ 
        "--duration": "300ms",
        "--initial": floating ? "8px" : "0",
        "--translate": floating ? "calc(100% + 8px)" : "100%",
        ...panelPs?.style
    }}
    className={twMerge(`max-h-screen max-w-screen overflow-auto z-50 p-4 gap-4 col duration-(--duration) bg-strong ${positionClass}`, panelPs?.className)}
    onTouchStart={e => {
        set("startTouch", e.touches[0][client]);
        set("moveTouch", e.touches[0][client]);
    }}
    onTouchMove={e => set("moveTouch", e.touches[0][client])}
    onTouchEnd={e => {
        if (closeOnMove && cannotClose) {
            closePanel();
        }
        set("startTouch", null);
        set("moveTouch", null);
    }}
    >
    <div 
        { ...iconProps}
        className={twMerge(`rounded-full bg-strong-border ${icon}`, iconProps?.className)}
    />
    {children}
</div> */}