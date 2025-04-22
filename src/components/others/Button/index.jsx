import { isNil } from "../../../globals/functions";
import { useVariantToProps } from "../../../hooks";
import { Spinner } from "../Spinner";

import { propTypes } from "./props";

// TODO badge

export const Button = (props) => {
    const { variantProps, mergeProps, setParams } = useVariantToProps("button", props);

    const { id, loading, icon, badge, children, buttonProps = {} } = variantProps;

    const { disabled } = buttonProps;

    return (
        <button { ...mergeProps("button", props => ({
            ...props,
            className: `flex justify-center items-center 
            gap-app-base px-app-md py-app-sm text-app-base rounded-app-md font-app-semibold
            text-white duration-(--really-quick) bg-primary
            not-disabled:active:brightness-soft`,
            disabled: loading || disabled
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
                    {icon}
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