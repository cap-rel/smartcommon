import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string,
    help: PropTypes.string,
    multiple: PropTypes.bool,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
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
    multipleGpsContainerProps: PropTypes.object,
    gpsPointsContainerProps: PropTypes.object,
    inputProps: PropTypes.object,
    locationTypeIconProps: PropTypes.object,
    latitudeProps: PropTypes.object,
    longitudeProps: PropTypes.object,
    deleteIconProps: PropTypes.object,
    buttonContainerProps: PropTypes.object,
    locationButtonProps: PropTypes.object,
    locationButtonIconProps: PropTypes.object,
    locationButtonSpinnerProps: PropTypes.object,
    locationButtonLabelProps: PropTypes.object,
    mapButtonProps: PropTypes.object,
    mapButtonIconProps: PropTypes.object,
    mapButtonSpinnerProps: PropTypes.object,
    mapButtonLabelProps: PropTypes.object,

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
