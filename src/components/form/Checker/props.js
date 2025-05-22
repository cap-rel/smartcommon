import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string,
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    variant: PropTypes.oneOf(["switch", "checkbox", "radio", "icon"]),
    icon: PropTypes.node,
    options: PropTypes.array,
    onValueChange: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    listProps: PropTypes.object,
    listItemProps: PropTypes.object,
    inputProps: PropTypes.object,
    optionLabelProps: PropTypes.object,
    switchProps: PropTypes.object,
    checkboxProps: PropTypes.object,
    radioProps: PropTypes.object,
    iconProps: PropTypes.object,
}