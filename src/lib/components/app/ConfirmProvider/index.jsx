import { useState, useCallback, useEffect, useId, useRef } from "react";
import { FaTriangleExclamation, FaTrashCan, FaCircleQuestion, FaCircleInfo } from "react-icons/fa6";

import { Overlay } from "lib/components";

import { ConfirmContext } from "./context";
import { DEFAULT_LABELS, propTypes } from "./props";

// Theme tokens only (soft-bg, strong-text, error...): they follow the
// light / dark palette like the other components.
const ICONS = {
    danger: { icon: FaTrashCan, bgClass: "bg-error/15", iconClass: "text-error" },
    delete: { icon: FaTrashCan, bgClass: "bg-error/15", iconClass: "text-error" },
    warning: { icon: FaTriangleExclamation, bgClass: "bg-warning/20", iconClass: "text-warning" },
    info: { icon: FaCircleInfo, bgClass: "bg-primary/15", iconClass: "text-primary" },
};

const DEFAULT_ICON = { icon: FaCircleQuestion, bgClass: "bg-medium-bg", iconClass: "text-medium-text" };

const CONFIRM_BUTTON_CLASSES = {
    danger: "bg-error text-white hover:brightness-soft",
    delete: "bg-error text-white hover:brightness-soft",
    // Warning is a light yellow in both palettes: dark text stays readable.
    warning: "bg-warning text-gray-900 hover:brightness-soft",
};

const DEFAULT_CONFIRM_CLASS = "bg-primary text-white hover:brightness-soft";

const FOCUS_RING = "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-soft-bg";

export const ConfirmProvider = ({ children, labels }) => {
    const [state, setState] = useState(null);

    const resolvedLabels = {
        cancel: labels?.cancel ?? DEFAULT_LABELS.cancel,
        confirm: labels?.confirm ?? DEFAULT_LABELS.confirm,
    };

    const baseId = useId();
    const titleId = `${baseId}-title`;
    const messageId = `${baseId}-message`;
    const detailId = `${baseId}-detail`;

    const dialogRef = useRef(null);
    const confirmButtonRef = useRef(null);

    const isOpen = state !== null;

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setState({
                ...options,
                onConfirm: () => { setState(null); resolve(true); },
                onCancel: () => { setState(null); resolve(false); },
            });
        });
    }, []);

    const alert = useCallback((options) => {
        return new Promise((resolve) => {
            setState({
                ...options,
                isAlert: true,
                onConfirm: () => { setState(null); resolve(true); },
                onCancel: () => { setState(null); resolve(true); },
            });
        });
    }, []);

    // Open: remember who had the focus, then focus the confirm button.
    // Close: give the focus back, so a keyboard user resumes where they were.
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        const previouslyFocused = document.activeElement;
        confirmButtonRef.current?.focus();

        return () => {
            if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus();
            }
        };
    }, [isOpen]);

    // Escape cancels a confirm. Listening in the capture phase and marking
    // the event handled keeps a Modal underneath (which ignores prevented
    // Escapes) from closing at the same time.
    useEffect(() => {
        if (!isOpen || state.isAlert) {
            return undefined;
        }
        const handleEscape = (e) => {
            if (e.key === "Escape" && !e.defaultPrevented) {
                e.preventDefault();
                state.onCancel();
            }
        };
        document.addEventListener("keydown", handleEscape, true);
        return () => document.removeEventListener("keydown", handleEscape, true);
    }, [isOpen, state]);

    // Modal dialog: Tab and Shift+Tab cycle between its own buttons.
    const handleDialogKeyDown = (e) => {
        if (e.key !== "Tab" || !dialogRef.current) {
            return;
        }
        const buttons = Array.from(dialogRef.current.querySelectorAll("button:not([disabled])"));
        if (buttons.length === 0) {
            return;
        }
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const iconConfig = ICONS[state?.type] || DEFAULT_ICON;
    const IconComponent = iconConfig.icon;
    const confirmBtnClass = CONFIRM_BUTTON_CLASSES[state?.type] || DEFAULT_CONFIRM_CLASS;

    // Named by the title, described by the message (and detail). Without a
    // title the message names the dialog.
    const hasTitle = Boolean(state?.title);
    const describedBy = [hasTitle ? messageId : null, state?.detail ? detailId : null].filter(Boolean).join(" ");

    return (
        <ConfirmContext.Provider value={{ confirm, alert }}>
            {children}

            {state && (
                <>
                    <Overlay
                        isOpen={true}
                        zIndex={100}
                        close={!state.isAlert ? state.onCancel : undefined}
                    />
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <div
                            ref={dialogRef}
                            role={state.isAlert ? "dialog" : "alertdialog"}
                            aria-modal="true"
                            aria-labelledby={hasTitle ? titleId : messageId}
                            aria-describedby={describedBy || undefined}
                            onKeyDown={handleDialogKeyDown}
                            data-component="ConfirmDialog"
                            className="bg-soft-bg text-strong-text border border-border rounded-xl max-w-sm w-full p-6 shadow-xl pointer-events-auto"
                        >
                            <div className="flex flex-col items-center text-center mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.bgClass}`}>
                                    <IconComponent aria-hidden="true" className={`text-xl ${iconConfig.iconClass}`} />
                                </div>
                                {hasTitle && (
                                    <h3 id={titleId} className="font-semibold text-strong-text mt-3 text-lg">
                                        {state.title}
                                    </h3>
                                )}
                            </div>

                            <p id={messageId} className="text-medium-text text-center mb-6">
                                {state.message}
                            </p>

                            {state.detail && (
                                <p id={detailId} className="text-sm text-soft-text text-center mb-6 truncate px-4 py-2 bg-medium-bg rounded-lg">
                                    {state.detail}
                                </p>
                            )}

                            <div className="flex gap-3">
                                {!state.isAlert && (
                                    <button
                                        type="button"
                                        onClick={state.onCancel}
                                        className={`flex-1 py-2.5 px-4 rounded-lg border border-border text-strong-text hover:bg-medium-bg transition-colors ${FOCUS_RING}`}
                                    >
                                        {state.cancelText || resolvedLabels.cancel}
                                    </button>
                                )}
                                <button
                                    ref={confirmButtonRef}
                                    type="button"
                                    onClick={state.onConfirm}
                                    className={`flex-1 py-2.5 px-4 rounded-lg transition-colors ${confirmBtnClass} ${FOCUS_RING}`}
                                >
                                    {state.confirmText || resolvedLabels.confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </ConfirmContext.Provider>
    );
};

ConfirmProvider.propTypes = propTypes;
