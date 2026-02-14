import { useEffect } from "react";
import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { FaXmark } from "react-icons/fa6";

import { propTypes } from "./props";

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
 * @param {string} props.size - Modal width: "sm" | "md" | "lg" | "xl" | "full" (default: "md")
 * @param {string} props.position - Position: "center" | "bottom" (default: "center")
 *   - "center": Centered on screen, rounded corners
 *   - "bottom": Mobile-style bottom sheet (full width, rounded top), centered on desktop
 * @param {number} props.zIndex - CSS z-index (default: 50)
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
        size = "md",
        position = "center",
        zIndex = 50,
    } = variantProps;

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

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                applyFunctionIfNotNil(onClose);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

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
                    ...p,
                    onClick: (e) => e.stopPropagation(),
                    className: `bg-white w-full ${sizeClasses[size] || sizeClasses.md} ${
                        position === "bottom" ? "rounded-t-2xl lg:rounded-2xl" : "rounded-2xl mx-4"
                    } max-h-[90vh] overflow-hidden flex flex-col`,
                }))}
            >
                {/* Header with title and close button */}
                {(title || showCloseButton) && (
                    <div
                        {...mergeProps("header", (p) => ({
                            ...p,
                            className: "flex items-center justify-between p-4 border-b border-gray-100",
                        }))}
                    >
                        {title && (
                            <h2
                                {...mergeProps("title", (p) => ({
                                    ...p,
                                    className: "text-lg font-bold text-gray-900",
                                }))}
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                {...mergeProps("closeButton", (p) => ({
                                    ...p,
                                    className: "p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
                                }))}
                            >
                                <FaXmark />
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
