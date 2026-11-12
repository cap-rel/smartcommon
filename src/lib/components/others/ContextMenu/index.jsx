import { useEffect, useRef, useState } from "react";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { MenuList } from "lib/components/others/Dropdown/MenuList";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

/**
 * Desktop right-click menu, fixed at the pointer. State comes from
 * useContextMenu():
 *
 *   const ctx = useContextMenu();
 *   <tr onContextMenu={(e) => ctx.open(e, items)}>...
 *   <ContextMenu state={ctx} />   // once in the page
 *
 * Same menu as Dropdown (role="menu", arrows, Home / End, Tab), focused on
 * its first entry. Escape or a picked entry close it and give the focus back
 * to the element that had it; an outside click, scroll or resize close it.
 */
export const ContextMenu = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("ContextMenu", props);
    const {
        state,
        zIndex = 60,
        testId = "context-menu",
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const { isOpen = false, x = 0, y = 0, items = [], close, returnFocusTo } = state ?? {};

    const menuRef = useRef(null);
    const [restoreFocus, setRestoreFocus] = useState(false);
    const wasOpenRef = useRef(false);

    const finish = (returnFocus) => {
        setRestoreFocus(returnFocus);
        applyFunctionIfNotNil(close);
    };

    useEffect(() => {
        if (!isOpen) return undefined;
        const onDown = (e) => {
            if (!menuRef.current?.contains(e.target)) finish(false);
        };
        // Capture phase, marked handled: a Modal or a hotkey listening on
        // the document does not also react to this Escape.
        const onKey = (e) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;
            e.preventDefault();
            finish(true);
        };
        const onMove = () => finish(false);
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
    }, [isOpen, close]);

    // Back to the element focused when the menu opened.
    useEffect(() => {
        if (isOpen) {
            wasOpenRef.current = true;
            return;
        }
        if (wasOpenRef.current && restoreFocus && returnFocusTo?.isConnected) {
            returnFocusTo.focus?.();
        }
        wasOpenRef.current = false;
    }, [isOpen, restoreFocus, returnFocusTo]);

    if (!isOpen) {
        return null;
    }

    return (
        <MenuList
            key={`${x}:${y}`}
            items={items}
            menuRef={menuRef}
            mergeProps={mergeProps}
            onSelect={(item) => {
                finish(true);
                applyFunctionIfNotNil(item.onClick);
            }}
            onTabOut={() => finish(false)}
            menuAttributes={{
                "aria-label": labels.menu,
                "data-testid": testId,
                "data-component": "ContextMenu",
                style: { position: "fixed", top: y, left: x, zIndex },
            }}
        />
    );
};

ContextMenu.propTypes = propTypes;
ContextMenu.defaultProps = defaultProps;
