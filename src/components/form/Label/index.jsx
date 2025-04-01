import { isEmpty, isNil, mergeProps } from "../../../globals/functions";

// IDEA Mini-popup for help

// TODO help

export const Label = ({
    id,
    label, 
    help,
    prefix,
    suffix,
    required,
    readOnly,
    disabled,
    children,
    variants,
    variant,
    variantParams,

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    childrenContainerProps,
    prefixProps,
    suffixProps,
    helpProps,
    ...props
}) => {
    const labelPs = { ...props, ...labelProps };

    return (
        <div 
            { ...mergeProps(
                {}, `flex flex-col gap-2`,
                containerProps, variants, variant, "containerProps", variantParams
            )}
        >
            {!isNil(label) && 
                <div 
                    { ...mergeProps(
                        {}, `gap-2 flex items-center`,
                        labelContainerProps, variants, variant, "labelContainerProps", variantParams
                    )}
                >
                    <label 
                        { ...mergeProps(
                            {}, `text-strong-text`,
                            labelPs, variants, variant, "labelProps", variantParams
                        )}
                        htmlFor={id}
                    >
                        {label}
                    </label>
                    {required && 
                        <div 
                            { ...mergeProps(
                                {}, `text-error`,
                                requiredStarProps, variants, variant, "requiredStarProps", variantParams
                            )}
                        >
                            *
                        </div>
                    }
                    {/* {help && <Help content={help} />} */}
                </div>
            }
            <div
                { ...mergeProps(
                    {}, `flex gap-2`,
                    childrenContainerProps, variants, variant, "childrenContainerProps", variantParams
                )}
            >
                {!isNil(prefix) &&
                    <div
                        { ...mergeProps(
                            {}, `text-strong-text`,
                            prefixProps, variants, variant, "prefixProps", variantParams
                        )}
                    >
                        {prefix}
                    </div>
                }
                {children}
                {!isNil(suffix) &&
                    <div
                        { ...mergeProps(
                            {}, `text-strong-text`,
                            suffixProps, variants, variant, "suffixProps", variantParams
                        )}
                    >
                        {suffix}
                    </div>
                }
            </div>
        </div>
    );
}