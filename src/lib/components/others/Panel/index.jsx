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
        position = "bottom",
        children,
        overlay = true,
        closeOnClickOverlay = true,
        closeOnDrag = true,
        close = () => {},
        isOpen,
    } = variantProps;
   
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

    // ----------------------------- POSITION

    const positions = {
        bottom: {},
        left: {

            drag: "x",
            dragConstraints: { right: 0 },
            className: "max-w-5/6 left-0 top-0 bottom-0 rounded-r-app-lg"
        },
    }

    // ----------------------------- FRAMER-MOTION
    const duration = 0.15;
    const openOpacity = 1;
    const closedOpacity = 0.3;

    const openX = 0;
    const closedX = -(panelWidth || window.innerWidth);
    const goBackWidth = -(panelWidth / 5);

    const panelX = isOpen ? openX : closedX;

    const x = useMotionValue(panelX);
    const opacity = useTransform(x, [closedX, openX], [closedOpacity, openOpacity]);

    // const openY = 0;
    // const closedY = panelHeight || window.innerHeight;
    // const goBackHeight = panelHeight / 5;

    // const panelY = isOpen ? openY : closedY;
    // const transition = { duration };

    // const y = useMotionValue(panelY);
    // const opacity = useTransform(y, [openY, closedY], [openOpacity, closedOpacity]);

    useEffect(() => {
        animate(x, panelX, { duration });
    }, [isOpen]);

    const handleDragEnd = () => {
        if (x.get() < goBackWidth) {
            close();
        } else {
            animate(x, openX, { duration });
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
                dragListener: closeOnDrag,
                drag: "x",
                dragConstraints: { right: 0 },
                dragElastic: 0,
                onDragEnd: handleDragEnd,
                ref: panelRef,
                style: { 
                    "--z-index": zIndex + 10,
                    x,
                    opacity,
                    ...variables
                },
                className: `rounded-r-app-lg fixed top-0 left-0 bottom-0 z-(--z-index) p-app-base
                gap-app-base flex flex-col bg-red-500 max-w-5/6 overflow-y-auto`
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