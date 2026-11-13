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
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  // Not editable, no address lookup, no suggestion list.
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // Consumer-provided message, rendered by Label below the field (unlike
  // `errors`, which useField computes from the validation rules).
  error: PropTypes.node,
  // Forces error display on standalone pages (no <Form> context).
  formSubmitted: PropTypes.bool,
  // Called with (ruleKey, conditionBoolean) each time a rule result flips.
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
  relativeContainerProps: PropTypes.object,
  Input: PropTypes.object,
  suggestionsContainerProps: PropTypes.object,
  suggestionProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    searchPlaceholder: "Search for an address...",
};
