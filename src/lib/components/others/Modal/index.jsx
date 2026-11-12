import { useEffect } from "react";
import { useDialog, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { FaXmark } from "react-icons/fa6";

import { DEFAULT_LABELS, propTypes } from "./props";

/**
 * Modal component - A reusable modal dialog
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility (required)
 * @param {function} props.onClose - Callback when modal should close
 * @param {string} props.title - Title displayed in the header
 * @param {React.ReactNode} props.children - Modal content
 * @param {boolean} props.showCloseButton - Show X button in header (default: true)
 * @param {boolean} props.closeOnOverlayClick - Close when clicking backdrop (default: true)
 * @param {boolean} props.closeOnEscape - Close on Escape (default: true)
 * @param {object} props.labels - i18n, merged over DEFAULT_LABELS (`close`: close button name)
 * @param {string} props.size - Modal width: "sm" | "md" | "lg" | "xl" | "full" (default: "md")
 * @param {string} props.position - Position: "center" | "bottom" (default: "center")
 *   - "center": Centered on screen, rounded corners
 *   - "bottom": Mobile-style bottom sheet (full width, rounded top), centered on desktop
 * @param {number} props.zIndex - CSS z-index (default: 50)
 *
 * Accessibility: while open the content is a modal dialog (role="dialog",
 * aria-modal) named by its title, or by an `aria-label` passed on the Modal
 * when there is no title. Focus moves into it, Tab stays inside, Escape
 * closes only the topmost dialog, and focus returns where it was on close.
 *
 * @example
 * // Basic usage
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Modal">
 *   <div className="p-4">Content here</div>
 * </Modal>
 *
 * @example
 * // Bottom sheet style (mobile-friendly)
 * <Modal isOpen={isOpen} onClose={handleClose} title="Select option" position="bottom">
 *   <div className="p-4">
 *     <button>Option 1</button>
 *     <button>Option 2</button>
 *   </div>
 * </Modal>
 *
 * @example
 * // Large modal without close button
 * <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
 *   <div className="p-6">
 *     <h2>Custom header here</h2>
 *     <p>Content...</p>
 *   </div>
 * </Modal>
 */
export const Modal = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Modal", props);
    const {
        isOpen,
        onClose,
        title,
        children,
        showCloseButton = true,
        closeOnOverlayClick = true,
        closeOnEscape = true,
        size = "md",
        position = "center",
        zIndex = 50,
        labels: userLabels,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const { dialogRef, titleId, onKeyDown } = useDialog({ isOpen, onClose, closeOnEscape });

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Size classes for desktop (mobile is always full width)
    const sizeClasses = {
        sm: "lg:max-w-sm",
        md: "lg:max-w-md",
        lg: "lg:max-w-lg",
        xl: "lg:max-w-xl",
        full: "lg:max-w-4xl",
    };

    // Position classes for flex container
    const positionClasses = {
        center: "items-center justify-center",
        bottom: "items-end lg:items-center lg:justify-center",
    };

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            applyFunctionIfNotNil(onClose);
        }
    };

    return (
        <div
            {...mergeProps("overlay", (p) => ({
                ...p,
                onClick: handleOverlayClick,
                style: { "--z-index": zIndex },
                className: `fixed inset-0 bg-black/50 z-(--z-index) flex ${positionClasses[position] || positionClasses.bottom}`,
            }))}
        >
            <div
                {...mergeProps("content", (p) => ({
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": title ? titleId : undefined,
                    tabIndex: -1,
                    ...p,
                    ref: dialogRef,
                    "data-component": "Modal",
                    onKeyDown: (e) => {
                        applyFunctionIfNotNil(p.onKeyDown, e);
                        onKeyDown(e);
                    },
                    onClick: (e) => e.stopPropagation(),
                    className: `bg-soft-bg text-strong-text outline-none w-full ${sizeClasses[size] || sizeClasses.md} ${
                        position === "bottom" ? "rounded-t-2xl lg:rounded-2xl" : "rounded-2xl mx-4"
                    } max-h-[90vh] overflow-hidden flex flex-col`,
                }), { forwardAttributes: true })}
            >
                {/* Header with title and close button */}
                {(title || showCloseButton) && (
                    <div
                        {...mergeProps("header", (p) => ({
                            ...p,
                            className: "flex items-center justify-between p-4 border-b border-border",
                        }))}
                    >
                        {title && (
                            <h2
                                {...mergeProps("title", (p) => ({
                                    ...p,
                                    id: titleId,
                                    className: "text-lg font-bold text-strong-text",
                                }))}
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                {...mergeProps("closeButton", (p) => ({
                                    "aria-label": labels.close,
                                    ...p,
                                    className: "p-2 text-soft-text hover:text-strong-text hover:bg-medium-bg rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none",
                                }))}
                            >
                                <FaXmark aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body content (scrollable) */}
                <div
                    {...mergeProps("body", (p) => ({
                        ...p,
                        className: "flex-1 overflow-y-auto",
                    }))}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = propTypes;
