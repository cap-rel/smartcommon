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

    // ----------------------------- FRAMER-MOTION
    const duration = 0.15;
    const openOpacity = 1;
    const closedOpacity = 0.3;

    const openPosition = 0;
    // const goBackWidth = -(panelWidth / 5);

    const positions = {
        bottom: {
            motion: "positive",
            drag: "y",
            dragConstraints: { top: 0 },
            className: "max-h-5/6 left-0 right-0 bottom-0 rounded-t-app-lg",
            closedPosition: panelHeight || window.innerHeight,
            // goBack: motionValue.get() < -(panelWidth / 5),
        },
        top: {
            motion: "negative",
            drag: "y",
            dragConstraints: { bottom: 0 },
            className: "max-h-5/6 left-0 top-0 right-0 rounded-b-app-lg",
            closedPosition: -(panelHeight || window.innerHeight),
            // goBack: motionValue.get() < -(panelWidth / 5),
        },
        right: {
            motion: "positive",
            drag: "x",
            dragConstraints: { left: 0 },
            className: "max-w-5/6 right-0 top-0 bottom-0 rounded-l-app-lg",
            closedPosition: panelWidth || window.innerWidth,
            // goBack: motionValue.get() < -(panelWidth / 5),
        },
        left: {
            motion: "negative",
            drag: "x",
            dragConstraints: { right: 0 },
            className: "max-w-5/6 left-0 top-0 bottom-0 rounded-r-app-lg",
            closedPosition: -(panelWidth || window.innerWidth),
            // goBack: motionValue.get() < -(panelWidth / 5),
        },
    };

    const { motion, closedPosition, drag, dragConstraints, className } = positions[position] ?? positions.bottom;

    const motions = {
        positive: {
            position: [openPosition, closedPosition],
            opacity: [openOpacity, closedOpacity],
        },
        negative: {
            position: [closedPosition, openPosition],
            opacity: [closedOpacity, openOpacity]
        }
    };

    const panelPosition = isOpen ? openPosition : closedPosition;

    const motionValue = useMotionValue(panelPosition);
    const opacity = useTransform(motionValue, ...Object.values(motions[motion]));

    useEffect(() => {
        animate(motionValue, panelPosition, { duration });
    }, [isOpen]);

    const handleDragEnd = () => {
        // if (x.get() < goBackWidth) {
            close();
        // } else {
        //     animate(motionValue, openMotionValue, { duration });
        // }
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
                drag,
                dragConstraints,
                dragElastic: 0,
                onDragEnd: handleDragEnd,
                ref: panelRef,
                style: { 
                    "--z-index": zIndex + 10,
                    [drag]: motionValue,
                    opacity,
                    ...variables
                },
                className: `fixed z-(--z-index) p-app-base
                gap-app-base flex flex-col bg-red-500 overflow-y-auto ${className}`
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