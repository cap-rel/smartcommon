import { twMerge } from "tailwind-merge";

export const Radio = ({
    checked,
    
    radioProps,
    circleProps,
    ...props
}) => {
    const radioPs = { ...props, ...radioProps };

    return (
        <div
            { ...radioPs}
            style={{ transition: "border-color 200ms, background-color 200ms, filter 100ms", ...radioPs?.style }}
            className={twMerge(`relative duration-50 size-7 border-3 rounded-full active:brightness-soft shrink-0 ${checked ? "border-primary" : "border-strong-border"}`, radioPs?.className)}
        >
            <div 
                { ...circleProps}
                className={twMerge(`absolute-full-center duration-200 bg-primary rounded-full ${checked ? "opacity-100 size-4" : "opacity-0 size-0"}`, circleProps?.className)}
            />
        </div>
    );
};