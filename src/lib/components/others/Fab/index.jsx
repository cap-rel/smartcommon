import { useState, useCallback } from "react";
import { isNil } from "lodash";
import { FaPlus } from "react-icons/fa";

import { useVariantMerger } from "lib/hooks";

import { propTypes, defaultProps } from "./props";

const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-16 h-16 text-xl",
};

const actionSizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg",
};

const colorClasses = {
    primary: "bg-primary hover:bg-primary/90 text-primary-text",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-text",
    tertiary: "bg-tertiary hover:bg-tertiary/90 text-tertiary-text",
    neutral: "bg-gray-700 hover:bg-gray-600 text-white",
};

const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
};

const directionTransforms = {
    up: (index, gap) => ({ transform: `translateY(-${(index + 1) * gap}px)` }),
    down: (index, gap) => ({ transform: `translateY(${(index + 1) * gap}px)` }),
    left: (index, gap) => ({ transform: `translateX(-${(index + 1) * gap}px)` }),
    right: (index, gap) => ({ transform: `translateX(${(index + 1) * gap}px)` }),
};

export const Fab = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Fab", props);

    const {
        id,
        icon: Icon = FaPlus,
        label,
        onClick,
        position = "bottom-right",
        size = "md",
        color = "primary",
        zIndex = 50,
        actions,
        direction = "up",
        isOpen: controlledIsOpen,
        onOpenChange,
    } = variantProps;

    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = !isNil(controlledIsOpen);
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const hasActions = actions && actions.length > 0;

    const setOpen = useCallback((value) => {
        if (isControlled) {
            onOpenChange?.(value);
        } else {
            setInternalIsOpen(value);
        }
    }, [isControlled, onOpenChange]);

    const toggle = useCallback(() => {
        setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const handleMainClick = useCallback((e) => {
        if (hasActions) {
            toggle();
        } else {
            onClick?.(e);
        }
    }, [hasActions, toggle, onClick]);

    const handleActionClick = useCallback((action, e) => {
        action.onClick?.(e);
        setOpen(false);
    }, [setOpen]);

    const gap = size === "sm" ? 44 : size === "lg" ? 72 : 60;

    return (
        <div
            {...mergeProps("container", (p) => ({
                ...p,
                style: { "--z-index": zIndex },
                className: `fixed z-(--z-index) ${positionClasses[position]}`,
            }))}
        >
            {/* Action buttons (speed-dial) */}
            {hasActions && (
                <div
                    {...mergeProps("actionsContainer", (p) => ({
                        ...p,
                        className: "absolute inset-0 flex items-center justify-center",
                    }))}
                >
                    {actions.map((action, index) => {
                        const ActionIcon = action.icon;
                        const actionColor = action.color || "neutral";

                        return (
                            <button
                                key={index}
                                {...mergeProps("action", (p) => ({
                                    ...p,
                                    onClick: (e) => handleActionClick(action, e),
                                    style: {
                                        ...directionTransforms[direction](index, gap),
                                        transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index - 1) * 30}ms`,
                                    },
                                    className: `
                                        absolute rounded-full shadow-lg flex items-center justify-center
                                        transition-all duration-200 active:scale-95
                                        ${actionSizeClasses[size]}
                                        ${colorClasses[actionColor]}
                                        ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                                    `,
                                    "aria-label": action.label,
                                }))}
                            >
                                <ActionIcon />
                                {action.label && (
                                    <span
                                        {...mergeProps("label", (p) => ({
                                            ...p,
                                            className: `
                                                absolute whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded
                                                ${direction === "up" || direction === "down" ? "right-full mr-2" : ""}
                                                ${direction === "left" ? "top-full mt-2" : ""}
                                                ${direction === "right" ? "top-full mt-2" : ""}
                                                ${isOpen ? "opacity-100" : "opacity-0"}
                                                transition-opacity duration-200
                                            `,
                                        }))}
                                    >
                                        {action.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Main FAB button */}
            <button
                {...mergeProps("fab", (p) => ({
                    ...p,
                    onClick: handleMainClick,
                    className: `
                        relative rounded-full shadow-lg flex items-center justify-center
                        transition-all duration-200 active:scale-95 hover:shadow-xl
                        ${sizeClasses[size]}
                        ${colorClasses[color]}
                        ${hasActions && isOpen ? "rotate-45" : ""}
                    `,
                    "aria-label": label || "Action button",
                    "aria-expanded": hasActions ? isOpen : undefined,
                }))}
            >
                <Icon />
            </button>
        </div>
    );
};

Fab.propTypes = propTypes;
Fab.defaultProps = defaultProps;
