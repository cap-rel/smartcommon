import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    
    type: PropTypes.oneOf(["switch", "checkbox", "icon", "radio"]),
    checkedIcon: PropTypes.node,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,

    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    defaultValue: PropTypes.bool,

    formSubmitted: PropTypes.bool,
    onError: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    starProps: PropTypes.object,
    childrenContainerProps: PropTypes.object,
    helpProps: PropTypes.object,
    prefixProps: PropTypes.object,
    suffixProps: PropTypes.object,
    footerProps: PropTypes.object,
    helpIconProps: PropTypes.object,
    helpAndErrorsContainerProps: PropTypes.object,
    helpProps: PropTypes.object,
    errorProps: PropTypes.object,
    
    switchProps: PropTypes.object,
    switchCircleProps: PropTypes.object,
    checkboxProps: PropTypes.object,
    checkboxIconProps: PropTypes.object,
    childrenContainerProps: PropTypes.object,
    radioProps: PropTypes.object,
    checkedIconProps: PropTypes.object,
};
