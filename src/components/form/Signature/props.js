import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string,
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    settings: PropTypes.object,
    onValueChange: PropTypes.func,
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    inputProps: PropTypes.object,
    signatureContainerProps: PropTypes.object,
    relativeContainerProps: PropTypes.object,
    signatureProps: PropTypes.object,
    filterProps: PropTypes.object,
    buttonContainerProps: PropTypes.object,
    clearButtonProps: PropTypes.object,
    clearButtonIconProps: PropTypes.object,
    clearButtonLabelProps: PropTypes.object,
    validateButtonProps: PropTypes.object,
    validateButtonIconProps: PropTypes.object,
    validateButtonLabelProps: PropTypes.object,
};