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
  inputContainerProps: PropTypes.object,
  inputProps: PropTypes.object,
  valueProps: PropTypes.object,
};