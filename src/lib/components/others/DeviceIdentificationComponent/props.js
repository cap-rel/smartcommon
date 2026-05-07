import PropTypes from "prop-types";

export const propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func,
    // Override the inline error label by inspecting the thrown error.
    getErrorLabel: PropTypes.func,

    // Value used by the "this is a brand new device" radio option.
    // Must NOT collide with any UUID returned in user.deviceOptions.
    noDeviceValue: PropTypes.string,

    // Top icon component (default: react-icons MdDevices). Pass null to hide.
    icon: PropTypes.elementType,

    abortTimeoutMs: PropTypes.number,
    identifyTimeoutMs: PropTypes.number,

    // Styling slots
    containerProps: PropTypes.object,
    formProps: PropTypes.object,
    iconWrapperProps: PropTypes.object,
    iconProps: PropTypes.object,
    titleProps: PropTypes.object,
    descriptionProps: PropTypes.object,
    devicesCheckerProps: PropTypes.object,
    labelInputProps: PropTypes.object,
    submitButtonProps: PropTypes.object,
    errorAlertProps: PropTypes.object,

    labels: PropTypes.shape({
        title: PropTypes.string,
        devicesDescription: PropTypes.string,
        noDevicesDescription: PropTypes.string,
        devicesCheckerLabel: PropTypes.string,
        noDeviceLabel: PropTypes.string,
        newDeviceInputLabel: PropTypes.string,
        newDeviceInputHelp: PropTypes.string,
        newDeviceInputPlaceholder: PropTypes.string,
        submitLabel: PropTypes.string,
        identifyError: PropTypes.string,
    }),
};

export const defaultProps = {
    noDeviceValue: "noDevice",
    abortTimeoutMs: 15000,
    labels: {},
};

export const DEFAULT_LABELS = {
    title: "Identification de l'appareil",
    devicesDescription:
        "Sélectionnez un des appareils enregistrés sur votre compte, "
        + "ou créez-en un nouveau pour cet appareil.",
    noDevicesDescription:
        "Aucun appareil n'est enregistré sur votre compte. "
        + "Donnez un nom à cet appareil pour l'enregistrer.",
    devicesCheckerLabel: "Choisir un appareil",
    noDeviceLabel: "Nouvel appareil",
    newDeviceInputLabel: "Nom de l'appareil",
    newDeviceInputHelp:
        "Choisissez un nom qui vous permettra de reconnaître "
        + "cet appareil parmi les autres (ex : iPhone Eric).",
    newDeviceInputPlaceholder: "Mon appareil",
    submitLabel: "Valider",
    identifyError: "Impossible d'enregistrer l'appareil. Vérifiez votre connexion.",
};
