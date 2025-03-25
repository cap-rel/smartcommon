import { FaCheck } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

export const Checkbox = ({
    checked,
    
    checkboxProps,
    checkIconProps,
    ...props
}) => {
    const checkboxPs = { ...props, ...checkboxProps };

    return (
        <div
            { ...checkboxPs}
            style={{ transition: "background-color 200ms, filter 100ms", ...checkboxPs?.style }}
            className={twMerge(`relative size-7 rounded-md shrink-0 active:brightness-soft ${checked ? "bg-primary" : "bg-strong-bg"}`, checkboxPs?.className)}
        >
            <FaCheck
                { ...checkIconProps}
                className={twMerge(`size-5 absolute left-1 duration-200 text-white ${checked ? "bottom-1 opacity-100" : "bottom-0 opacity-0"}`, checkIconProps?.className)}
            />
        </div>
    );
};