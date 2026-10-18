import PropTypes from "prop-types";

export const propTypes = {
  label: PropTypes.string,
  help: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // Forces error display on standalone pages (no <Form> context).
  formSubmitted: PropTypes.bool,
  // Called with (ruleKey, conditionBoolean) each time a rule result flips.
  onError: PropTypes.func,

  containerProps: PropTypes.object,
  labelContainerProps: PropTypes.object,
  labelProps: PropTypes.object,
  requiredStarProps: PropTypes.object,
  helpProps: PropTypes.object,
  inputContainerProps: PropTypes.object,
  inputProps: PropTypes.object,
  inputSpinnerProps: PropTypes.object,
  inputIconProps: PropTypes.object,
  listProps: PropTypes.object,
  listItemProps: PropTypes.object
};