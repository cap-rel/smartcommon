import { mergeProps } from "../../../../globals";

export const Switch = ({
    checked,
    variants,
    variant,

    switchProps,
    switchCircleProps,
    ...props
}) => {
    const switchPs = { ...props, ...switchProps };

    const variantParams = { isChecked: checked };

    return (
        <div
            { ...mergeProps(
                { transition: "background-color 200ms, filter 100ms" }, `relative rounded-full w-11 h-6 shrink-0 active:brightness-soft ${checked ? "bg-primary" : "bg-strong-bg"}`,
                switchPs, variants, variant, "switchProps", variantParams
            )}
        >
            <div 
                { ...mergeProps(
                    {}, `absolute top-1 left-1 rounded-full size-4 duration-200 bg-soft-bg ${checked && "translate-x-5"}`,
                    switchCircleProps, variants, variant, "switchCircleProps", variantParams
                )}
            />
        </div>
    );
};