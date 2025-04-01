import { mergeProps } from "../../../../globals";

export const CheckedIcon = ({
    checked,
    icon,
    variants,
    variant,

    iconProps,
    ...props
}) => {
    const iconPs = { ...props, ...iconProps };

    const variantParams = { isChecked: checked };

    return (
        <div
            { ...mergeProps(
                { transition: "color 200ms, filter 100ms" }, `text-2xl shrink-0 size-6 active:brightness-soft ${checked ? "text-primary" : "text-strong-bg"}`,
                iconPs, variants, variant, "iconProps", variantParams
            )}
        >
            {icon}
        </div>
    );
};