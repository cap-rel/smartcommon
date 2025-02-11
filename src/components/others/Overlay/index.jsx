export const Overlay = ({
    isVisible = false,
    variant = "",
    customType = null,
    custom = {
        classNames: null
    },
    ...props
}) => {
    return (
        <div 
            className={`fixed z-20 bg-black/50 inset-0 duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            { ...props}
        />
    );
};