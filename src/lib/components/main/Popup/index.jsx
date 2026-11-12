import { RiCloseLargeLine } from "react-icons/ri";
import { isNil } from "lodash";

import { Button, Overlay } from "lib/components";
import { useDialog, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

// TODO z-index prop

// TODO error when click on overlay (surely relative to the close function)

export const Popup = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Popup", props);

    const { 
        id,
        responsive = true,
        zIndex = 40,
        children,
        overlay = true,
        closeOnClickOverlay = true,
        // A popup the user may dismiss by its overlay may be dismissed by
        // Escape too; one that must be answered keeps both closed.
        closeOnEscape = closeOnClickOverlay,
        // No close button unless asked, the default consumers rely on (React
        // 19 ignores defaultProps, so it is written here).
        closeButton = false,
        title,
        close = () => {},
        isOpen,
        keepMounted = true,
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // Hooks run before the early return below (rules of hooks).
    const { dialogRef, titleId, onKeyDown } = useDialog({ isOpen, onClose: close, closeOnEscape });

    // When keepMounted is false, a closed popup is fully unmounted (its content
    // -- including any submit buttons -- leaves the DOM) instead of being kept
    // hidden via opacity. Trade-off: the closing fade animation is lost. Default
    // true preserves the historical behaviour; opt out to keep the DOM clean
    // (e.g. many always-mounted popups whose hidden submit buttons complicate
    // E2E targeting).
    if (!isOpen && !keepMounted) {
        return null;
    }

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
            <div { ...mergeProps("popupBackdrop", props => ({
                ...props,
                style: { "--z-index": zIndex + 10 },
                className: `z-(--z-index) fixed inset-0 flex justify-center items-center p-app-lg pointer-events-none`
            }))}>

                <div { ...mergeProps("popup", props => ({
                    // Modal dialog while open. Closed but kept mounted, it is
                    // inert: its hidden content can neither be focused nor
                    // read.
                    ...(isOpen
                        ? {
                            role: "dialog",
                            "aria-modal": "true",
                            "aria-labelledby": isNil(title) ? undefined : titleId,
                            tabIndex: -1,
                        }
                        : { inert: true, "aria-hidden": "true" }),
                    ...props,
                    ref: dialogRef,
                    onKeyDown: e => {
                        applyFunctionIfNotNil(props.onKeyDown, e);
                        onKeyDown(e);
                    },
                    "data-component": "Popup",
                    className: `
                        w-full max-h-full duration-(--really-quick) overflow-y-auto rounded-app-md p-app-md pb-app-lg gap-app-base text-app-sm flex flex-col bg-soft-bg text-strong-text
                        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                        ${responsive ? "lg:w-200 lg:h-160 lg:max-w-3/5 lg:max-h-3/5" : ""}
                        outline-none
                    `
                }), { forwardAttributes: true })}>

                    {(!isNil(title) || closeButton) &&
                        <div { ...mergeProps("titleAndButtonContainer", props => ({
                            ...props,
                            className: `flex justify-between items-center w-full gap-app-base`
                        }))}>

                            <div { ...mergeProps("title", props => ({
                                ...props,
                                id: titleId,
                                className: `text-app-base font-app-semibold`
                            }))}>
                                {title}
                            </div>

                            {closeButton &&
                                <Button { ...mergeProps("Button", props => ({
                                    icon: RiCloseLargeLine,
                                    ...props,
                                    onClick: e => {
                                        e.preventDefault();
                                        close();
                                        applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                                    },
                                    buttonProps: {
                                        "aria-label": labels.close,
                                        ...props.buttonProps,
                                        className: `text-app-lg z-60 bg-soft-bg text-soft-text p-app-xs rounded-app-xl -mr-app-xs -mt-app-xs`
                                    },
                                }))} />
                            }
                        </div>
                    }
                    
                    {children}

                </div>
            </div>
        </>
    );
};

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
