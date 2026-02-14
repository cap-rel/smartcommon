import { useEffect } from "react";
import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { FaXmark } from "react-icons/fa6";

import { propTypes } from "./props";

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

    // Handle escape key
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

    const sizeClasses = {
        sm: "lg:max-w-sm",
        md: "lg:max-w-md",
        lg: "lg:max-w-lg",
        xl: "lg:max-w-xl",
        full: "lg:max-w-4xl",
    };

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
                {/* Header */}
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

                {/* Body */}
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
