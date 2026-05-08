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

    const formContext = useContext(FormContext);
    const { submit = () => {}, isFormSubmitting } = formContext ?? {};

    // Check if button is inside a Form provider (not just if FormContext type exists)
    const isInForm = !isNil(formContext);

    const isSubmitType = type === "submit";

    const isLoading = loading || (isSubmitType && isFormSubmitting);
    
    return (
        <button { ...mergeProps("button", props => ({
            ...props,
            // Forward `type` to the DOM button so that consumers passing
            // type="submit" still trigger native form submit (when the button
            // sits in a plain <form> with onSubmit), and consumers passing
            // type="button" don't accidentally submit a parent form.
            // Default "button" matches HTML default for standalone buttons
            // but is safer than "submit" inside a <form>.
            type: type ?? "button",
            className: `relative flex justify-center items-center
            gap-app-base px-app-md py-app-sm text-app-base rounded-app-md font-app-semibold
            text-white duration-(--really-quick) bg-primary
            not-disabled:active:brightness-soft disabled:brightness-soft
            ${(!disabled && !loading) && "cursor-pointer"}
            `,
            disabled: loading || disabled || isFormSubmitting,
            onClick: (e) => {
                // type=submit + smartcommon <Form> provider: cancel native
                // submit and route through the provider state machine.
                // type=submit + no provider: let the browser dispatch the
                // native submit so a plain <form onSubmit> consumer fires.
                // Other types: cancel to avoid the implicit-submit pitfall
                // when the button is nested in a <form>.
                if (isSubmitType && isInForm) {
                    e.preventDefault();
                    onClick(e);
                    submit(e);
                } else if (!isSubmitType) {
                    e.preventDefault();
                    onClick(e);
                } else {
                    onClick(e);
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
                    {typeof icon === 'function' ? icon() : icon}
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