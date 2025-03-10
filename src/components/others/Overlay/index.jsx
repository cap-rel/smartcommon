import { twMerge } from "tailwind-merge";
import { propTypes } from "./props";

export const Overlay = ({
    isOpen = false,
    closeOverlay = () => {},
    overlayProps,
    ...props
}) => {
    const overlayPs = { ...props, ...overlayProps };

    return (
        <div 
            { ...overlayPs}
            onClick={closeOverlay}
            className={twMerge(`fixed z-40 bg-black/50 inset-0 duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`, overlayPs?.className)}
        />
    );
};

Overlay.propTypes = propTypes;