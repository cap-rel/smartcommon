import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string,
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    onValueChange: PropTypes.func,
    options: PropTypes.array,
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    selectContainerProps: PropTypes.object,
    selectProps: PropTypes.object,
    optionProps: PropTypes.object,
    iconProps: PropTypes.object,
};