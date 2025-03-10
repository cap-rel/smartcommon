import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string,
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    onValueChange: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    inputProps: PropTypes.object,
    durationContainerProps: PropTypes.object,
    unitContainerProps: PropTypes.object,
    unitLabelProps: PropTypes.object,
    unitInputContainerProps: PropTypes.object,
    unitLeftProps: PropTypes.object,
    unitInputProps: PropTypes.object,
    unitRightProps: PropTypes.object,
};