import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    multiple: PropTypes.bool,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onChange: PropTypes.func,
    /** Called after onChange with (position.coords, position): the full
     * GeolocationCoordinates (accuracy, altitude, ...) and the raw
     * GeolocationPosition (timestamp). */
    onLocate: PropTypes.func,
    required: PropTypes.bool,
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
    // Row holding the locate button and the saved / empty state.
    buttonContainerProps: PropTypes.object,
    // Locate button: a Button, styled through buttonProps, iconProps,
    // labelProps and Spinner.
    LocateButton: PropTypes.object,
    // Saved / empty state text next to the button.
    locationProps: PropTypes.object,

    // i18n: merged shallowly over DEFAULT_LABELS.
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    requiredError: "You must locate yourself.",
    locateSuccess: "Location successful",
    locateError: "Location error",
    locateButton: "Locate",
    savedState: "Saved",
    emptyState: "No location saved",
};
