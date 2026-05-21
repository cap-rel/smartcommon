import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    labelRow: PropTypes.bool,
    help: PropTypes.string,
    multiple: PropTypes.bool,
    onLocate: PropTypes.func,
    
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
    requiredError: "Vous devez géolocaliser.",
    locateSuccess: "Succès de la géolocalisation",
    locateError: "Erreur de la géolocalisation",
    locateButton: "Géolocaliser",
    savedState: "Enregistrée",
    emptyState: "Aucune Localisation enregistrée",
};
