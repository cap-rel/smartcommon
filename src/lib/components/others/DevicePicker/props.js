import PropTypes from "prop-types";

import { detectAutoViewport } from "lib/components/app/ViewportProvider";

// Supported icon keys mirror the smartAuth backend contract:
// "phone" | "tablet" | "laptop" | "desktop".
// Anything else is rendered as the default ("phone") icon.
export const SUPPORTED_DEVICE_ICONS = ["phone", "tablet", "laptop", "desktop"];

export const DEFAULT_DEVICE_ICON = "phone";

// Icon stored with a device created under a layout choice: the layout says
// what the device is, "auto" asks the same heuristic as ViewportProvider.
const ICON_BY_VIEWPORT = { mobile: "phone", tablet: "tablet", desktop: "desktop" };
export const DEVICE_LABEL_MAX_LENGTH = 100;

export const propTypes = {
    // List of logical user-devices already created by this user. May be empty.
    // Each entry: { id, label, icon, viewport_mode, date_lastseen, session_count }.
    existingDevices: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.string,
            viewport_mode: PropTypes.string,
            date_lastseen: PropTypes.string,
            session_count: PropTypes.number,
        })
    ),

    // Called when the user picks an existing user-device. Receives the
    // numeric id. May return a Promise; the picker stays disabled until
    // it settles.
    onPick: PropTypes.func.isRequired,

    // Called when the user creates a brand-new user-device. Receives
    // (label, icon), plus viewportMode when the layout question is asked.
    // May return a Promise.
    onCreate: PropTypes.func.isRequired,

    // Ask the layout of the app on this device (auto, mobile, tablet,
    // desktop) on the new device form, instead of its icon. Only under a
    // ViewportProvider; true by default.
    enableViewportMode: PropTypes.bool,

    // Layout preselected on the new device form. Default: the one
    // ViewportProvider detects for this device.
    defaultViewportMode: PropTypes.oneOf(["auto", "mobile", "tablet", "desktop"]),

    // Optional escape hatch. When provided, a "Annuler" button is shown.
    // Most integrations leave this undefined (the picker is mandatory).
    onCancel: PropTypes.func,

    // External loading indicator (parent-driven). When true, every
    // interactive element is disabled and the primary button shows a
    // spinner. The picker also has its own internal "submitting" state
    // for the call currently in flight, but external callers can flip
    // this to lock the UI for additional reasons (e.g. while finalising
    // the post-login routing).
    loading: PropTypes.bool,

    // Optional inline error to display above the form. Reset by the
    // parent when appropriate (the picker never resets it on its own).
    error: PropTypes.string,

    // Styling slots. Each one is spread onto the matching DOM node so
    // the consumer can tweak look-and-feel without touching the lib.
    containerProps: PropTypes.object,
    titleProps: PropTypes.object,
    descriptionProps: PropTypes.object,
    listProps: PropTypes.object,
    itemProps: PropTypes.object,
    newDeviceButtonProps: PropTypes.object,
    formProps: PropTypes.object,
    labelInputProps: PropTypes.object,
    iconSelectProps: PropTypes.object,
    viewportModeCheckerProps: PropTypes.object,
    submitButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object,
    errorAlertProps: PropTypes.object,

    labels: PropTypes.shape({
        title: PropTypes.string,
        descriptionWithDevices: PropTypes.string,
        descriptionEmpty: PropTypes.string,
        newDeviceButton: PropTypes.string,
        newDeviceTitle: PropTypes.string,
        labelInputLabel: PropTypes.string,
        labelInputPlaceholder: PropTypes.string,
        labelInputHelp: PropTypes.string,
        iconSelectLabel: PropTypes.string,
        iconPhone: PropTypes.string,
        iconTablet: PropTypes.string,
        iconLaptop: PropTypes.string,
        iconDesktop: PropTypes.string,
        viewportModeLabel: PropTypes.string,
        viewportModeHelp: PropTypes.string,
        viewportModeOptionAuto: PropTypes.string,
        viewportModeOptionMobile: PropTypes.string,
        viewportModeOptionTablet: PropTypes.string,
        viewportModeOptionDesktop: PropTypes.string,
        sessionsSingular: PropTypes.string,
        sessionsPlural: PropTypes.string,
        lastSeenPrefix: PropTypes.string,
        submitNew: PropTypes.string,
        submitPick: PropTypes.string,
        cancel: PropTypes.string,
        validationLabelRequired: PropTypes.string,
        validationLabelTooLong: PropTypes.string,
    }),
};

export const defaultProps = {
    existingDevices: [],
    loading: false,
    labels: {},
};

export const DEFAULT_LABELS = {
    title: "Which device are you using?",
    descriptionWithDevices:
        "Pick an existing device or add a new one for this application.",
    descriptionEmpty:
        "Name this device so you can find it easily later.",
    newDeviceButton: "+ New device",
    newDeviceTitle: "New device",
    labelInputLabel: "Device name",
    labelInputPlaceholder: "My iPhone",
    labelInputHelp:
        "This name will group all applications installed on this phone (for example).",
    iconSelectLabel: "Device type",
    iconPhone: "Phone",
    iconTablet: "Tablet",
    iconLaptop: "Laptop",
    iconDesktop: "Desktop",
    viewportModeLabel: "Device type",
    viewportModeHelp:
        "Choose how the app should adapt its layout for this device. "
        + "You can change this later in settings.",
    viewportModeOptionAuto: "Auto-detect",
    viewportModeOptionMobile: "Smartphone",
    viewportModeOptionTablet: "Tablet",
    viewportModeOptionDesktop: "Desktop",
    sessionsSingular: "1 connected application",
    sessionsPlural: "{count} connected applications",
    lastSeenPrefix: "Last access:",
    submitNew: "Create this device",
    submitPick: "Use this device",
    cancel: "Cancel",
    validationLabelRequired: "Name this device.",
    validationLabelTooLong: "Name is too long (100 characters maximum).",
};

// Icon of a device created with the given layout.
export const iconForViewportMode = (mode) => {
    const resolved = mode === "auto" || !ICON_BY_VIEWPORT[mode] ? detectAutoViewport() : mode;
    return ICON_BY_VIEWPORT[resolved] ?? DEFAULT_DEVICE_ICON;
};

// Normalises an icon string to one of the supported values. Anything
// not in the whitelist falls back to the default "phone".
export const normaliseDeviceIcon = (icon) => {
    if (typeof icon !== "string") return DEFAULT_DEVICE_ICON;
    return SUPPORTED_DEVICE_ICONS.includes(icon) ? icon : DEFAULT_DEVICE_ICON;
};

// Resolves the localised "N apps connected" string for an existing
// device card. Falls back to a numeric-only string if the consumer
// did not provide the templated plural label.
export const formatSessionCount = (count, labels) => {
    const n = Number.isFinite(count) ? count : 0;
    if (n <= 1) {
        return labels.sessionsSingular ?? DEFAULT_LABELS.sessionsSingular;
    }
    const template = labels.sessionsPlural ?? DEFAULT_LABELS.sessionsPlural;
    return template.replace("{count}", String(n));
};
