import PropTypes from "prop-types";

export const propTypes = {
  id: PropTypes.string,

  label: PropTypes.string,
  help: PropTypes.string,
  icon: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  
  loading: PropTypes.bool,
  inputIcon: PropTypes.node,
  inputMode: PropTypes.string, // arrayOf
  size: PropTypes.number,
  placeholder: PropTypes.string,

  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  minLength: PropTypes.number,
  length: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.instanceOf(RegExp),
  patternMessage: PropTypes.string,

  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  formSubmitted: PropTypes.bool,
  onError: PropTypes.func,

  containerProps: PropTypes.object,
  labelContainerProps: PropTypes.object,
  iconProps: PropTypes.object,
  labelProps: PropTypes.object,
  starProps: PropTypes.object,
  childrenContainerProps: PropTypes.object,
  prefixProps: PropTypes.object,
  suffixProps: PropTypes.object,
  footerProps: PropTypes.object,
  helpIconProps: PropTypes.object,
  helpAndErrorsContainerProps: PropTypes.object,
  helpProps: PropTypes.object,
  errorProps: PropTypes.object,
  
  inputContainerProps: PropTypes.object,
  Spinner: PropTypes.object,
  inputIconProps: PropTypes.object,
  inputProps: PropTypes.object,
  MinusButton: PropTypes.object,
  PlusButton: PropTypes.object,
  PasswordButton: PropTypes.object,
};

export const defaultProps = {

};