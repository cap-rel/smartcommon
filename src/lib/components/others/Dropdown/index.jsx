import { cloneElement, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";

import { MenuList } from "./MenuList";
import { defaultProps, propTypes } from "./props";

const MENU_GAP_PX = 4;

/**
 * Click-triggered menu: top-bar user menu, kebab / overflow actions on rows
 * and cards. Mouse-first desktop brick (capdoc:pwa/DESKTOP_UI.md section 5),
 * fully usable from the keyboard.
 *
 * The menu is `position: fixed`, placed from the trigger's bounding rect, so
 * it escapes the overflow clipping of scroll containers without a portal. It
 * closes on outside click, Escape, Tab, scroll and resize. Floating overlays
 * are the one place a shadow (shadow-lg) is allowed by the desktop UI
 * conventions.
 *
 * trigger: an element (a button: it receives aria-haspopup, aria-expanded,
 * aria-controls and the toggle), a render function
 * ({ open, toggle, triggerProps }) => node, or any other node (wrapped in a
 * button).
 *
 * items: { key?, label, icon?, onClick?, danger?, disabled?, divider?, testId? }
 */
export const Dropdown = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Dropdown", props);
    const {
        items = [],
        trigger,
        align = "right",
        menuClassName = "",
        testId = "dropdown",
        zIndex = 50,
    } = variantProps;

    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [initialFocus, setInitialFocus] = useState("first");
    const [coords, setCoords] = useState({ top: 0, left: 0, right: 0 });
    const [labelledBy, setLabelledBy] = useState(undefined);
    // Whether closing gives the focus back to the trigger (Escape, a picked
    // item) or leaves it where the user put it (outside click, Tab, scroll).
    const [restoreFocus, setRestoreFocus] = useState(false);
    const wasOpenRef = useRef(false);

    const baseId = useId();
    const menuId = `${baseId}-menu`;
    const triggerId = `${baseId}-trigger`;

    // Event handlers only change state; the DOM work (placement, focus) is
    // done in the effects below.
    const close = useCallback(({ returnFocus = true } = {}) => {
        setRestoreFocus(returnFocus);
        setOpen(false);
    }, []);

    const openMenu = (focus = "first") => {
        setInitialFocus(focus);
        setOpen(true);
    };

    // On open: place the menu under the trigger (before paint) and name it
    // after the trigger element (the first child of the wrapper).
    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setCoords({
            top: Math.round(r.bottom + MENU_GAP_PX),
            left: Math.round(r.left),
            right: Math.round(window.innerWidth - r.right),
        });
        setLabelledBy(triggerRef.current.firstElementChild?.id || undefined);
    }, [open]);

    // On close: give the focus back to the trigger when asked.
    useEffect(() => {
        if (open) {
            wasOpenRef.current = true;
            return;
        }
        if (wasOpenRef.current && restoreFocus) {
            triggerRef.current?.firstElementChild?.focus?.();
        }
        wasOpenRef.current = false;
    }, [open, restoreFocus]);

    const toggle = () => {
        if (open) {
            close({ returnFocus: false });
        } else {
            openMenu("first");
        }
    };

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => {
            if (menuRef.current?.contains(e.target)) return;
            if (triggerRef.current?.contains(e.target)) return;
            close({ returnFocus: false });
        };
        // Capture phase, marked handled: a Modal or a hotkey listening on
        // the document does not also react to the Escape closing this menu.
        const onKey = (e) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;
            e.preventDefault();
            close();
        };
        // Close on any scroll (capture catches inner scrollers too) and on
        // resize: the fixed coordinates would drift otherwise.
        const onMove = () => close({ returnFocus: false });
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey, true);
        window.addEventListener("scroll", onMove, true);
        window.addEventListener("resize", onMove);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey, true);
            window.removeEventListener("scroll", onMove, true);
            window.removeEventListener("resize", onMove);
        };
    }, [open, close]);

    // ArrowDown / ArrowUp on the closed trigger open the menu on the first /
    // last item (WAI-ARIA menu button).
    const handleTriggerKeyDown = (e) => {
        if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
        e.preventDefault();
        openMenu(e.key === "ArrowUp" ? "last" : "first");
    };

    const triggerProps = {
        id: triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
        onKeyDown: handleTriggerKeyDown,
    };

    let triggerNode;
    if (typeof trigger === "function") {
        triggerNode = trigger({ open, toggle, triggerProps });
    } else if (isValidElement(trigger)) {
        // A DOM element takes the id (it names the menu); a component gets
        // the aria-* attributes, which smartcommon components forward.
        const isDomElement = typeof trigger.type === "string";
        triggerNode = cloneElement(trigger, {
            ...(isDomElement ? { id: trigger.props.id ?? triggerId } : {}),
            "aria-haspopup": "menu",
            "aria-expanded": open,
            "aria-controls": open ? menuId : undefined,
            onClick: (e) => {
                applyFunctionIfNotNil(trigger.props.onClick, e);
                toggle();
            },
            onKeyDown: (e) => {
                applyFunctionIfNotNil(trigger.props.onKeyDown, e);
                handleTriggerKeyDown(e);
            },
        });
    } else {
        triggerNode = (
            <button type="button" { ...triggerProps } onClick={toggle}>
                {trigger}
            </button>
        );
    }

    const positionStyle = align === "right"
        ? { top: coords.top, right: coords.right }
        : { top: coords.top, left: coords.left };

    const handleSelect = (item) => {
        close();
        applyFunctionIfNotNil(item.onClick);
    };

    return (
        <>
            <span { ...mergeProps("triggerWrapper", p => ({
                ...p,
                ref: triggerRef,
                className: "inline-flex",
            }))}>
                {triggerNode}
            </span>
            {open && (
                <MenuList
                    items={items}
                    menuRef={menuRef}
                    mergeProps={mergeProps}
                    initialFocus={initialFocus}
                    onSelect={handleSelect}
                    onTabOut={() => close({ returnFocus: false })}
                    menuAttributes={{
                        id: menuId,
                        "aria-labelledby": open ? labelledBy : undefined,
                        "data-testid": `${testId}-menu`,
                        "data-component": "Dropdown",
                        style: { position: "fixed", ...positionStyle, zIndex },
                        className: menuClassName,
                    }}
                />
            )}
        </>
    );
};

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;
