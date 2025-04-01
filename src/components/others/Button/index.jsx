import { isNil, mergeProps } from "../../../globals/functions";
import { Spinner } from "../Spinner";

import { buttonPropTypes } from "./props";
import { buttonVariants } from "./variants";

// TODO floating position

export const Button = ({
    loading = false,
    icon,
    disabled = false,
    // floatingPosition = "bottom-right",
    variant = "smart",

    children,

    iconProps,
    spinnerProps,
    ...buttonProps
}) => {

    // const buttonPs = { ...props, ...buttonProps };

    const variantParams = { disabled };

    return (
        <button
            disabled={disabled}
            { ...mergeProps(
                {}, `flex items-center gap-2 p-2 text-base duration-100 ${disabled ? "brightness-soft" : "active:brightness-soft"}`,
                buttonProps, buttonVariants, variant, "buttonProps", variantParams
            )}
        >
            {loading &&
                <Spinner />
            }
            {(!isNil(icon) && !loading) &&
                <div 
                    { ...mergeProps(
                        {}, `text-xl`,
                        iconProps, buttonVariants, variant, "iconProps", variantParams
                    )}
                >
                    {icon}
                </div>
            }
            {children}
        </button>
    );
};

Button.propTypes = buttonPropTypes