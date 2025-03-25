import { twMerge } from "tailwind-merge";

export const CheckedIcon = ({
    checked,
    icon,

    iconProps,
    ...props
}) => {
    const iconPs = { ...props, ...iconProps };

    return (
        <div
            { ...iconPs}
            style={{ transition: "color 200ms, filter 100ms", ...iconPs?.style }}
            className={twMerge(`text-[28px] shrink-0 active:brightness-soft ${checked ? "text-primary" : "text-strong-bg"}`, iconPs?.className)}
        >
            {icon}
        </div>
    );
};