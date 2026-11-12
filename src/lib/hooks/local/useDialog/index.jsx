import { useCallback, useEffect, useId, useRef } from "react";

// Open modal dialogs, bottom first ({ token, ref }). Only the last one reacts
// to Escape and traps Tab, so closing a dialog never closes the one underneath.
const openDialogs = [];

// A dialog nested in another one (a Popup inside a Modal) sits above it. When
// both open in the same render, the inner effect runs first: inserting the
// outer dialog below the dialogs it contains keeps the order right.
const registerDialog = (entry) => {
    const element = entry.ref.current;
    const index = element
        ? openDialogs.findIndex((other) => other.ref.current && element.contains(other.ref.current))
        : -1;
    if (index === -1) {
        openDialogs.push(entry);
    } else {
        openDialogs.splice(index, 0, entry);
    }
};

const unregisterDialog = (token) => {
    const index = openDialogs.findIndex((entry) => entry.token === token);
    if (index !== -1) {
        openDialogs.splice(index, 1);
    }
};

const FOCUSABLE = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=\"hidden\"])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "audio[controls]",
    "video[controls]",
    "[contenteditable]:not([contenteditable=\"false\"])",
    "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

const getFocusable = (container) => Array.from(container.querySelectorAll(FOCUSABLE))
    .filter((el) => !el.closest("[inert]"));

const isTopDialog = (token) => openDialogs[openDialogs.length - 1]?.token === token;

/**
 * Modal dialog behaviour shared by Modal, Popup and Panel.
 *
 * While `isOpen`:
 * - focus moves to the dialog element (unless an element inside already has
 *   it, e.g. an autoFocus field) and goes back to the previously focused
 *   element on close;
 * - Tab and Shift+Tab cycle inside the dialog;
 * - Escape calls `onClose` when `closeOnEscape` is true. Only the most
 *   recently opened dialog reacts, and an Escape already handled (marked
 *   `defaultPrevented`, e.g. by ConfirmProvider or an inner tool) is ignored.
 *
 * @param {object}   options
 * @param {boolean}  options.isOpen
 * @param {Function} [options.onClose]
 * @param {boolean}  [options.closeOnEscape=true]
 * @returns {{ dialogRef: object, titleId: string, onKeyDown: Function }}
 *   `dialogRef` and `onKeyDown` go on the element carrying role="dialog",
 *   `titleId` on its title (referenced by aria-labelledby).
 */
export const useDialog = ({ isOpen, onClose, closeOnEscape = true } = {}) => {
    const dialogRef = useRef(null);
    const token = useId();
    const titleId = `${token}-title`;

    // Latest values, read from the document listener without re-binding it.
    const onCloseRef = useRef(onClose);
    const closeOnEscapeRef = useRef(closeOnEscape);
    useEffect(() => {
        onCloseRef.current = onClose;
        closeOnEscapeRef.current = closeOnEscape;
    });

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        registerDialog({ token, ref: dialogRef });
        const previouslyFocused = document.activeElement;
        const dialog = dialogRef.current;
        if (dialog && !dialog.contains(document.activeElement)) {
            dialog.focus({ preventScroll: true });
        }

        // Bubble phase: ConfirmProvider and inner tools listen earlier and
        // mark the event handled, which this listener respects.
        const handleEscape = (e) => {
            if (e.key !== "Escape" || e.defaultPrevented || !isTopDialog(token)) {
                return;
            }
            if (!closeOnEscapeRef.current || typeof onCloseRef.current !== "function") {
                return;
            }
            e.preventDefault();
            onCloseRef.current();
        };
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
            unregisterDialog(token);
            if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, [isOpen, token]);

    // Focus trap: Tab past the last element wraps to the first one, and
    // Shift+Tab before the first (or from the dialog itself) to the last.
    const onKeyDown = useCallback((e) => {
        if (e.key !== "Tab" || e.defaultPrevented || !isOpen || !isTopDialog(token) || !dialogRef.current) {
            return;
        }
        const focusable = getFocusable(dialogRef.current);
        if (focusable.length === 0) {
            e.preventDefault();
            dialogRef.current.focus({ preventScroll: true });
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }, [isOpen, token]);

    return { dialogRef, titleId, onKeyDown };
};
