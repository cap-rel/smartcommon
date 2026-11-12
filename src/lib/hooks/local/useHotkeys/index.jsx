import { useEffect, useRef } from "react";

// Typing in these must not trigger a single-key shortcut.
const isTypingTarget = (el) => {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return el.isContentEditable === true;
};

// "mod" stands for Ctrl (Windows, Linux) or Cmd (macOS); then alt, shift,
// and the lowercase key ("space" for the space bar).
const comboFromEvent = (e) => {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("mod");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");
    const key = (e.key || "").toLowerCase();
    parts.push(key === " " ? "space" : key);
    return parts.join("+");
};

/**
 * Desktop keyboard shortcuts.
 *
 *   useHotkeys({
 *       "mod+k": () => searchRef.current?.focus(),
 *       "/": () => searchRef.current?.focus(),
 *       "escape": closeDetail,
 *   }, { enabled: isDesktop });
 *
 * A combo is a lowercase key, optionally prefixed with "mod+" (Ctrl or Cmd),
 * "alt+", "shift+" in that order: "mod+shift+s", "escape", "j", "space".
 * A matched shortcut prevents the browser default and calls handler(event).
 *
 * - A shortcut without Ctrl / Cmd / Alt (a bare "/" or "j") is ignored while
 *   the user types in an input, textarea, select or contenteditable;
 *   modifier combos and Escape still fire there.
 * - An event already handled (defaultPrevented, e.g. the Escape that closes
 *   a Dropdown, a ContextMenu or a confirm dialog) is ignored, as are keys
 *   pressed while an input method composes text.
 * - The latest `map` is always used: an inline object does not re-bind the
 *   listener on every render.
 *
 * @param {Object<string, Function>} map
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] false detaches the listener (e.g.
 *   outside the desktop viewport)
 */
export const useHotkeys = (map, { enabled = true } = {}) => {
    const mapRef = useRef(map);
    useEffect(() => {
        mapRef.current = map;
    });

    useEffect(() => {
        if (!enabled) return undefined;
        const handler = (e) => {
            if (e.defaultPrevented || e.isComposing) return;
            const fn = mapRef.current?.[comboFromEvent(e)];
            if (typeof fn !== "function") return;
            const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
            const isEscape = (e.key || "").toLowerCase() === "escape";
            if (!hasModifier && !isEscape && isTypingTarget(e.target)) return;
            e.preventDefault();
            fn(e);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [enabled]);
};
