import PropTypes from "prop-types";

export const propTypes = {
  // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
  labels: PropTypes.object,
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
  type: PropTypes.string,
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  /** Lower bound, in the unit of the value: number, ms timestamp for
   * date / datetime-local, minutes since midnight for time. */
  min: PropTypes.number,
  /** Upper bound, same unit as min. */
  max: PropTypes.number,
  /** Length rules, applied to text-like types. */
  minLength: PropTypes.number,
  length: PropTypes.number,
  maxLength: PropTypes.number,
  /** RegExp, or string matched against the whole value (HTML semantics). */
  pattern: PropTypes.oneOfType([PropTypes.instanceOf(RegExp), PropTypes.string]),
  /** Message for the pattern rule (default: labels.patternError). */
  patternError: PropTypes.string,

  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // Consumer-provided message, rendered by Label below the field (unlike
  // `errors`, which useField computes from the validation rules).
  error: PropTypes.node,
  // Forces error display on standalone pages (no <Form> context).
  formSubmitted: PropTypes.bool,
  // Called with (ruleKey, conditionBoolean) each time a rule result flips.
  onError: PropTypes.func,

  onFocus: PropTypes.func,
  onBlur: PropTypes.func,

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

export const DEFAULT_LABELS = {
    requiredError: "This field is required.",
    numberError: "Please enter a valid number.",
    minError: (min) => `The value must be at least ${min}.`,
    maxError: (max) => `The value must be at most ${max}.`,
    minDateError: (min) => `The date must be on or after ${min}.`,
    maxDateError: (max) => `The date must be on or before ${max}.`,
    minTimeError: (min) => `The time must be ${min} or later.`,
    maxTimeError: (max) => `The time must be ${max} or earlier.`,
    minLengthError: (n) => `Must be at least ${n} characters long.`,
    lengthError: (n) => `Must be exactly ${n} characters long.`,
    maxLengthError: (n) => `Must be at most ${n} characters long.`,
    patternError: "The value does not match the expected format.",
};
