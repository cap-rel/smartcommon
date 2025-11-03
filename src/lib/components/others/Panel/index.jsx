import { Overlay } from "../Overlay";
import { useStates, useVariantMerger } from "../../../hooks";
import { defaultProps, propTypes } from "./props";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, DragControls, useAnimationControls } from "framer-motion";

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
    const { variantProps, mergeProps, setParams } = useVariantMerger("Panel", props);

    const { 
        id,
        zIndex = 40,
        children,
        overlay = true,
        closeOnClickOverlay = true,
        closeOnMove,
        close = () => {},
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

    // ----------------------------- FRAMER-MOTION
    const controls = useAnimationControls();

    const duration = 0.15;
    const openOpacity = 1;
    const closedOpacity = 0.3;
    const openY = 0;
    const closedY = panelHeight || "100%";
    const goBackHeight = panelHeight / 5;

    const panelY = isOpen ? openY : closedY;
    const transition = { duration };

    const y = useMotionValue(panelY);
    const opacity = useTransform(y, [openY, closedY], [openOpacity, closedOpacity]);

    useEffect(() => {
        controls.start({ y: panelY, transition });
    }, [isOpen, controls]);

    const handleDragEnd = () => {
        if (y.get() > goBackHeight) {
            close();
        } else {
            controls.start({ y: openY, transition });
        }
    };

    return (
        <>
            {overlay &&
                <Overlay { ...mergeProps("Overlay", props => ({
                    zIndex: zIndex,
                    ...props,
                    isOpen,
                    close: closeOnClickOverlay && close
                }))} />
            }
            <motion.div { ...mergeProps("panel", props => ({
                ...props,
                drag: "y",
                dragConstraints: { top: 0 },
                dragElastic: 0,
                animate: controls,
                onDragEnd: handleDragEnd,
                ref: panelRef,
                style: { 
                    "--z-index": zIndex + 10,
                    y,
                    opacity,
                    ...variables
                },
                className: `rounded-t-app-lg fixed left-0 right-0 bottom-0 z-(--z-index) p-app-base
                gap-app-base flex flex-col bg-red-500 max-h-5/6`
            }))}>
                {/* duration-(--medium) */}
                {/* ${isOpen ? "translate-y-0" : "translate-y-full"}` */}
                {children}
            </motion.div>
        </>
    );
};

Panel.prototypes = propTypes;
Panel.defaultProps = defaultProps;

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