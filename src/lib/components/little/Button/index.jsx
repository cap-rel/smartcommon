import { isNil } from "lib/utils";
import { useVariantMerger } from "lib/hooks";
import { Spinner } from "lib/components";

import { propTypes, defaultProps } from "./props";

// TODO badge

/** UI button component for user interaction */
export const Button = (props) => {
    const { variantProps, mergeProps, mergeQuickProps, setParams } = useVariantMerger("Button", props);

    const { 
        id,
        label,
        responsive = true,
        loading = false,
        icon,
        badge,
        children,
        disabled = false,
        onClick = () => {}
    } = variantProps;
    
    return (
        <button { ...mergeProps("button", props => ({
            ...props,
            className: `relative flex justify-center items-center
            gap-app-base px-app-md py-app-sm text-app-base rounded-app-md font-app-semibold
            text-white duration-(--really-quick) bg-primary
            not-disabled:active:brightness-soft disabled:brightness-soft
            ${(!disabled && !loading) && "cursor-pointer"}
            `,
            disabled: loading || disabled,
            onClick
        }))}>
            {loading &&
                <Spinner { ...mergeProps("Spinner", props => ({
                    ...props,
                    spinnerProps: {
                        ...props.spinnerProps,
                        className: `border-white border-l-white/30`
                    },
                }))} />
            }

            {(!isNil(icon) && !loading) &&
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