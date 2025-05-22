import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    variant: PropTypes.oneOf(["switch", "checkbox", "icon", "radio"]),
    icon: PropTypes.node,
    onValueChange: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    inputProps: PropTypes.object,
    variantProps: PropTypes.object,
};
