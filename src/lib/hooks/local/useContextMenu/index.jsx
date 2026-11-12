import { useCallback, useState } from "react";

// Room kept between the menu and the window edges, and the size used to
// keep it on screen (min-width of the menu, height of one entry).
const EDGE_PX = 8;
const MENU_WIDTH_PX = 220;
const ITEM_HEIGHT_PX = 40;

const CLOSED = { isOpen: false, x: 0, y: 0, items: [], returnFocusTo: null };

/**
 * State of the desktop right-click menu rendered by <ContextMenu>.
 *
 *   const ctx = useContextMenu();
 *   // on each target: onContextMenu={(e) => ctx.open(e, itemsForThatTarget)}
 *   // once in the page: <ContextMenu state={ctx} />
 *
 * `open(event, items)` cancels the browser menu and opens this one at the
 * pointer, kept inside the window. Opened from the keyboard (context menu
 * key, Shift+F10: no pointer position), it opens under the target instead.
 * The element focused at that moment gets the focus back when the menu is
 * closed by Escape or by picking an entry.
 *
 * items: { key?, label, icon?, onClick?, danger?, disabled?, divider?, testId? }
 *
 * @returns {{ isOpen: boolean, x: number, y: number, items: Array,
 *   returnFocusTo: Element|null, open: Function, close: Function }}
 *   `open` is the opening function (as in the smartInterventions brick);
 *   the open flag is `isOpen`.
 */
export const useContextMenu = () => {
    const [state, setState] = useState(CLOSED);

    const open = useCallback((event, items) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        const list = items ?? [];

        let pointerX = event?.clientX ?? 0;
        let pointerY = event?.clientY ?? 0;
        const target = event?.currentTarget;
        if (pointerX === 0 && pointerY === 0 && typeof target?.getBoundingClientRect === "function") {
            const rect = target.getBoundingClientRect();
            pointerX = rect.left;
            pointerY = rect.bottom;
        }

        const x = Math.min(pointerX, window.innerWidth - MENU_WIDTH_PX);
        const y = Math.min(pointerY, window.innerHeight - EDGE_PX - list.length * ITEM_HEIGHT_PX);
        setState({
            isOpen: true,
            x: Math.max(EDGE_PX, x),
            y: Math.max(EDGE_PX, y),
            items: list,
            returnFocusTo: document.activeElement,
        });
    }, []);

    const close = useCallback(
        () => setState((current) => (current.isOpen ? { ...current, isOpen: false } : current)),
        [],
    );

    return { ...state, open, close };
};
