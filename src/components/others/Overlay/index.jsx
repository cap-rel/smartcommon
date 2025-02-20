import { twMerge } from "tailwind-merge";

export const Overlay = ({
    isVisible = false,
    setVisibility = () => {},
    variant = {
        classNames: {
            overlay: null
        }
    },
    ...props
}) => {
    const { classNames } = variant;
    return (
        <div 
            className={twMerge(`fixed z-40 bg-black/50 inset-0 duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`, classNames.overlay)}
            onClick={() => setVisibility(false)}
            { ...props}
        />
    );
};