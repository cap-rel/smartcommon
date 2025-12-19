import { isUndefined } from "lodash";
import { useContext } from "react";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { FormContext, Spinner } from "lib/components";

import { propTypes, defaultProps } from "./props";

// TODO badge

/** UI button component for user interaction */
export const Button = (props) => {
    const { variantProps, mergeProps, mergeQuickProps, setParams } = useVariantMerger("Button", props);

    const { 
        id,
        label,
        type,
        responsive = true,
        loading = false,
        icon,
        badge,
        children,
        disabled = false,
        onClick = () => {}
    } = variantProps;

    const { submit = () => {}, isFormSubmitting } = useContext(FormContext) ?? {};

    const isInForm = !isUndefined(FormContext);

    const isSubmitType = type === "submit";

    const isLoading = loading || (isSubmitType && isFormSubmitting);
    
    return (
        <button { ...mergeProps("button", props => ({
            ...props,
            className: `relative flex justify-center items-center
            gap-app-base px-app-md py-app-sm text-app-base rounded-app-md font-app-semibold
            text-white duration-(--really-quick) bg-primary
            not-disabled:active:brightness-soft disabled:brightness-soft
            ${(!disabled && !loading) && "cursor-pointer"}
            `,
            disabled: loading || disabled || isFormSubmitting,
            onClick: (e) => {
                e.preventDefault();
                onClick(e);

                if (isInForm && isSubmitType) {
                    submit(e);
                }
            }
        }))}>
            {isLoading &&
                <Spinner { ...mergeProps("Spinner", props => ({
                    ...props,
                    spinnerProps: {
                        ...props.spinnerProps,
                        className: `border-white border-l-white/30`
                    },
                }))} />
            }

            {(!isNil(icon) && !isLoading) &&
                <div { ...mergeProps("icon", props => ({
                    ...props,
                    className: `shrink-0`
                }))}>
                    {icon()}
                </div>
            }

            {!isNil(badge) &&
                <div { ...mergeProps("badge", props => ({
                    ...props,
                    className: `absolute -translate-y-1/2 translate-x-1/2 top-0 right-0 
                    rounded-app-xl bg-secondary tex-white text-app-xs font-app-semibold 
                    flex justify-center items-center min-h-6 min-w-6 px-app-xxs`
                }))}>
                    {badge}
                </div>
            }

            {!isNil(label) &&
                <div { ...mergeProps("label", props => props)}>
                    {label}
                </div>
            }

            {children}

        </button>
    );
};

// --button-background-color
// --button-padding
// --button-gap
// --button-filter-duration
// --button-filter-brightness
// --button-rounded

// --button-font-size
// --button-spinner-size
// --button-icon-font-size
// --button-children-font-size

// --button-color
// --button-spinner-color ?
// --button-icon-color
// --button-children-color

// --button-children-font-weight

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;