import PropTypes from "prop-types";

export const arrayPropTypes = {
    label: PropTypes.string,
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    onValueChange: PropTypes.func,
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    arrayContainerProps: PropTypes.object,
    arrayInputProps: PropTypes.object,
    tagsContainerProps: PropTypes.object,
    tagProps: PropTypes.object,
    inputProps: PropTypes.object,
};