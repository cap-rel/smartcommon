import { Overlay } from "../Overlay";
import { useStates, useVariantMerger } from "../../../hooks";
import { defaultProps, propTypes } from "./props";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { applyFunctionIfNotNil } from "../../../utils";

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
        duration = 0.18,
        goBackLimit = 1/5
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
    const openOpacity = 1;
    const closedOpacity = 0;

    const openPosition = 0;

    const positions = {
        bottom: {
            direction: "positive",
            drag: "y",
            dragConstraints: { top: 0 },
            className: "max-h-5/6 left-0 right-0 bottom-0 rounded-t-app-lg",
            closedPosition: panelHeight || window.innerHeight,
            goBackValue: panelHeight * goBackLimit
        },
        top: {
            direction: "negative",
            drag: "y",
            dragConstraints: { bottom: 0 },
            className: "max-h-5/6 left-0 top-0 right-0 rounded-b-app-lg",
            closedPosition: -(panelHeight || window.innerHeight),
            goBackValue: -(panelHeight * goBackLimit)
        },
        right: {
            direction: "positive",
            drag: "x",
            dragConstraints: { left: 0 },
            className: "max-w-5/6 right-0 top-0 bottom-0 rounded-l-app-lg",
            closedPosition: panelWidth || window.innerWidth,
            goBackValue: panelWidth * goBackLimit
        },
        left: {
            direction: "negative",
            drag: "x",
            dragConstraints: { right: 0 },
            className: "max-w-5/6 left-0 top-0 bottom-0 rounded-r-app-lg",
            closedPosition: -(panelWidth || window.innerWidth),
            goBackValue: -(panelWidth * goBackLimit)
        },
    };

    const { direction, closedPosition, drag, dragConstraints, className, goBackValue } = positions[position] ?? positions.bottom;

    const motionDirections = {
        positive: {
            position: [openPosition, closedPosition],
            opacity: [openOpacity, closedOpacity],
            goBackCondition: motionPos => motionPos.get() < goBackValue
        },
        negative: {
            position: [closedPosition, openPosition],
            opacity: [closedOpacity, openOpacity],
            goBackCondition: motionPos => motionPos.get() > goBackValue
        }
    };

    const panelPosition = isOpen ? openPosition : closedPosition;

    const motionPosition = useMotionValue(panelPosition);
    const opacity = useTransform(motionPosition, ...Object.values(motionDirections[direction]));

    useEffect(() => {
        animate(motionPosition, panelPosition, { duration });
    }, [isOpen]);

    const handleDragEnd = () => {
        if (motionDirections[direction].goBackCondition(motionPosition)) {
            animate(motionPosition, openPosition, { duration });
        } else {
            close();
        }
    };

    return (
        <>
            {overlay &&
                <motion.div { ...mergeProps("overlay", props => ({
                    ...props,
                    onClick: e => {
                        if (closeOnClickOverlay) {
                            close();
                        }
                        applyFunctionIfNotNil(props.onClick, e);
                    },
                    style: { "--z-index": zIndex, opacity },
                    className: `z-(--z-index) fixed bg-black/50 inset-0 ${!isOpen && "pointer-events-none"}`
                    // duration-(--medium) ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
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
                    [drag]: motionPosition,
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