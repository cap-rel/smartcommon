import { useCallback, useState } from "react";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

// Floating Action Button: a fixed, circular, icon-only action trigger
// (the "+" add button at the bottom of a list, etc.).
//
// Why a dedicated component and not <Button>: <Button> is a labeled button
// sized by the theme font-size, and an icon-only child rendered at 1em then
// inherits that font-size. Going through className/twMerge to resize it is
// non-deterministic (the theme's custom text-app-* sizes and the standard
// text-* scale share the same font-size group). A FAB instead sizes its glyph
// in EXPLICIT PIXELS, bypassing the font-size cascade entirely, so the icon is
// always visible regardless of the surrounding theme.
//
// Speed-dial: pass `actions` to turn the FAB into a speed-dial. The main click
// then toggles the menu open/closed (the icon rotates 45deg) and the action
// buttons fan out along `direction`. Open state is uncontrolled by default, or
// controllable via `isOpen` + `onOpenChange`. Action buttons are sized in px,
// derived from `size`, to keep the same theme-proof sizing as the main button.
//
// Props:
//   - icon      : a react-icons component (passed as the component itself,
//                 e.g. icon={FaPlus}). Rendered at `iconSize` px.
//   - onClick   : click handler (ignored when `actions` are provided - the
//                 main button then toggles the speed-dial instead).
//   - color     : "primary" | "secondary" (themed background). Default secondary.
//   - size      : circle diameter in px. Default 64.
//   - iconSize  : glyph size in px. Default 32.
//   - position  : "bottom-right" | "bottom-left". Default bottom-right.
//   - children  : optional, rendered instead of `icon` when no icon is given.
//   - label     : accessible name for the main button (aria-label).
//   - actions   : speed-dial entries [{ icon, label, onClick, color }] where
//                 color is "primary" | "secondary" | "neutral" (default neutral).
//   - direction : speed-dial fan-out "up" | "down" | "left" | "right". Default up.
//   - isOpen / onOpenChange : controlled speed-dial open state (optional).
//   - buttonProps: passthrough to the native <button> (data-testid, aria-label,
//                 className override merged via twMerge, etc.).
//   - containerProps / actionProps / actionLabelProps : styling slots.

// Fan-out transform for a speed-dial action at `index`, `gap` px apart.
const directionTransforms = {
    up: (index, gap) => `translateY(-${(index + 1) * gap}px)`,
    down: (index, gap) => `translateY(${(index + 1) * gap}px)`,
    left: (index, gap) => `translateX(-${(index + 1) * gap}px)`,
    right: (index, gap) => `translateX(${(index + 1) * gap}px)`,
};

// Literal class tokens (no `bg-${color}` interpolation): Tailwind only
// generates classes it can see as complete tokens at build time.
const actionBgClass = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    neutral: "bg-gray-700",
};

export const FAB = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("FAB", props);

    const {
        icon: Icon,
        onClick = () => {},
        color = "secondary",
        size = 64,
        iconSize = 32,
        position = "bottom-right",
        children,
        label,
        actions,
        direction = "up",
        isOpen: controlledIsOpen,
        onOpenChange,
    } = variantProps;

    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = !isNil(controlledIsOpen);
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const hasActions = Array.isArray(actions) && actions.length > 0;

    const setOpen = useCallback((value) => {
        if (isControlled) {
            onOpenChange?.(value);
        } else {
            setInternalIsOpen(value);
        }
    }, [isControlled, onOpenChange]);

    const handleMainClick = useCallback((e) => {
        if (hasActions) {
            setOpen(!isOpen);
        } else {
            onClick(e);
        }
    }, [hasActions, isOpen, setOpen, onClick]);

    const handleActionClick = useCallback((action, e) => {
        action.onClick?.(e);
        setOpen(false);
    }, [setOpen]);

    // Bg literal (no interpolation) for the main button.
    const bgClass = color === "primary" ? "bg-primary" : "bg-secondary";
    const positionClass = position === "bottom-left" ? "bottom-20 left-4" : "bottom-20 right-4";

    // Speed-dial geometry, derived from the main diameter so actions stay
    // proportional whatever `size` the consumer picks.
    const actionSize = Math.round(size * 0.8);
    const actionIconSize = Math.round(actionSize * 0.5);
    const gap = size + 12;

    return (
        <div {...mergeProps("container", (p) => ({
            ...p,
            // Fixed wrapper carries the screen anchor + stacking context; the
            // button below is `relative` inside it (identical to the previous
            // single-button layout when there are no actions).
            className: `fixed ${positionClass} z-30 ${p.className || ""}`,
        }))}>
            {hasActions && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {actions.map((action, index) => {
                        const ActionIcon = action.icon;
                        const bg = actionBgClass[action.color] || actionBgClass.neutral;
                        return (
                            <button
                                key={index}
                                {...mergeProps("action", (p) => ({
                                    ...p,
                                    type: "button",
                                    onClick: (e) => handleActionClick(action, e),
                                    "aria-label": action.label,
                                    style: {
                                        width: `${actionSize}px`,
                                        height: `${actionSize}px`,
                                        transform: directionTransforms[direction](index, gap),
                                        transitionDelay: isOpen
                                            ? `${index * 50}ms`
                                            : `${(actions.length - index - 1) * 30}ms`,
                                        ...(p.style || {}),
                                    },
                                    className: `absolute rounded-full shadow-lg flex items-center justify-center
                                        text-white transition-all duration-200 active:scale-95 ${bg}
                                        ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`,
                                }))}
                            >
                                {ActionIcon && (
                                    <ActionIcon size={actionIconSize} color="#ffffff" aria-hidden="true" />
                                )}
                                {action.label && (
                                    <span {...mergeProps("actionLabel", (p) => ({
                                        ...p,
                                        className: `absolute whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded
                                            transition-opacity duration-200
                                            ${direction === "up" || direction === "down" ? "right-full mr-2" : "top-full mt-2"}
                                            ${isOpen ? "opacity-100" : "opacity-0"}`,
                                    }))}>
                                        {action.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <button {...mergeProps("button", (p) => ({
                ...p,
                type: "button",
                onClick: handleMainClick,
                "aria-label": label ?? p["aria-label"],
                "aria-expanded": hasActions ? isOpen : undefined,
                // Diameter in inline style so it never depends on which w-/h-
                // utilities the consumer's Tailwind build happens to generate.
                style: { width: `${size}px`, height: `${size}px`, ...(p.style || {}) },
                className: `relative rounded-full ${bgClass} text-white shadow-lg
                    flex items-center justify-center active:brightness-90
                    transition-transform duration-200 ${hasActions && isOpen ? "rotate-45" : ""}`,
            }))}>
                {Icon ? <Icon size={iconSize} color="#ffffff" aria-hidden="true" /> : children}
            </button>
        </div>
    );
};
