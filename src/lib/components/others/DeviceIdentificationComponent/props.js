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
    title: "Device identification",
    devicesDescription:
        "Select one of the devices registered on your account, "
        + "or create a new one for this device.",
    noDevicesDescription:
        "No device is registered on your account. "
        + "Name this device to register it.",
    devicesCheckerLabel: "Choose a device",
    noDeviceLabel: "New device",
    newDeviceInputLabel: "Device name",
    newDeviceInputHelp:
        "Choose a name that will let you recognise "
        + "this device among others (e.g. Eric's iPhone).",
    newDeviceInputPlaceholder: "My device",
    submitLabel: "Validate",
    identifyError: "Failed to register the device. Check your connection.",
};
