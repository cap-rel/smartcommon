import PropTypes from "prop-types";

export const inputPropTypes = {
  label: PropTypes.string,
  labelRow: PropTypes.bool,
  help: PropTypes.string,
  onValueChange: PropTypes.func,
  type: PropTypes.oneOf(["varchar", "email", "password", "phone", "url", "ip", "date", "timestamp", "time", "datetime", "integer", "stock", "float", "price", "priceCurrency"]),
  leftIcon: PropTypes.object,
  rightIcon: PropTypes.object,
  containerProps: PropTypes.object,
  labelContainerProps: PropTypes.object,
  labelProps: PropTypes.object,
  requiredStarProps: PropTypes.object,
  helpProps: PropTypes.object,
  relativeContainerProps: PropTypes.object,
  leftIconProps: PropTypes.object,
  rightIconProps: PropTypes.object, 
  inputProps: PropTypes.object,
};