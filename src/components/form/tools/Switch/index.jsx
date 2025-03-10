import { twMerge } from "tailwind-merge";

export const Switch = ({
    checked,

    switchProps,
    circleProps,
    ...props
}) => {
    const switchPs = { ...props, ...switchProps };

    return (
        <div
            { ...switchPs}
            style={{ transition: "background-color 200ms, filter 100ms", ...switchPs?.style }}
            className={twMerge(`relative rounded-full w-13 h-7 shrink-0 active:brightness-soft ${checked ? "bg-primary" : "bg-strong-border"}`, switchPs?.className)}
        >
            <div 
                { ...circleProps}
                className={twMerge(`absolute top-1 left-1 rounded-full size-5 duration-200 bg-strong ${checked && "translate-x-6"}`, circleProps?.className)}
            />
        </div>
    );
};