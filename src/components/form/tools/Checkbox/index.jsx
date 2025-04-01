import { FaCheck } from "react-icons/fa6";
import { mergeProps } from "../../../../globals";

export const Checkbox = ({
    checked,
    variants,
    variant,

    checkboxProps,
    checkboxIconProps,
    ...props
}) => {
    const checkboxPs = { ...props, ...checkboxProps };

    const variantParams = { isChecked: checked };

    return (
        <div
            { ...mergeProps(
                { transition: "background-color 200ms, filter 100ms" }, `relative size-6 rounded-md shrink-0 active:brightness-soft ${checked ? "bg-primary" : "bg-strong-bg"}`,
                checkboxPs, variants, variant, "checkboxProps", variantParams
            )}
        >
            <FaCheck
                { ...mergeProps(
                    {}, `size-4 absolute left-1 duration-200 text-white ${checked ? "bottom-1 opacity-100" : "bottom-0 opacity-0"}`,
                    checkboxIconProps, variants, variant, "checkboxIconProps", variantParams
                )}
            />
        </div>
    );
};