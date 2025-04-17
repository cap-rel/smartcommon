import { isNil } from "../../../globals/functions";
import { useVariantToProps } from "../../../hooks";
import { Spinner } from "../Spinner";

import { propTypes } from "./props";

// TODO params

export const Button = (props) => {
    // const basePropsKeys = ["loading", "icon", "children", "destroyTheme", "componentVariant"];
    const { variantProps, mergeProps, setParams } = useVariantToProps("button", props);

    const { loading, icon, text, badge, buttonProps = {} } = variantProps;

    const { disabled } = buttonProps;

    // useEffect(() => {
    //     setParams({ disabled, loading });
    // }, []);

    return (
        <button { ...mergeProps("button", props => ({
            ...props,
            className: `flex justify-center items-center 
            gap-app-base px-app-md py-app-sm text-app-base rounded-app-md font-app-semibold
            text-white duration-(--quick) bg-primary
            disabled:brightness-soft active:brightness-soft`,
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
            {!isNil(text) &&
                <div { ...mergeProps("text", props => ({
                    ...props,
                    className: `truncate`
                }))}>
                    {text}
                </div>
            }
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