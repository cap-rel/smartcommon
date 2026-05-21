import PropTypes from "prop-types";

export const propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func,
    // Override the inline error label by inspecting the thrown error
    // (typically err.response?.status). Default returns labels.loginError.
    getErrorLabel: PropTypes.func,
    // Override the QR error label by inspecting the thrown error.
    // Default maps the smartAuth QrPairController error codes:
    //   pairing_not_claimable / 409 -> labels.pairingAlreadyClaimed
    //   pairing_not_found     / 404 -> labels.pairingNotFound
    //   pairing_expired       / 410 -> labels.pairingExpired
    //   rate_limited          / 429 -> labels.rateLimited
    //   invalid_pairing_id    / 400 -> labels.invalidQrError
    //   default                     -> labels.claimError
    getQrErrorLabel: PropTypes.func,

    showEntities: PropTypes.bool,
    // When true (default), shows a checkbox the user can tick to flag the
    // current access as shared / untrusted. Ticked => credentials NOT
    // persisted on this device. Unticked (default) => credentials persisted.
    // The corresponding payload field sent to api.login is `rememberMe`
    // (negated server-side from this UI flag).
    showSharedDevice: PropTypes.bool,

    enableQrPair: PropTypes.bool,
    qrPollIntervalMs: PropTypes.number,
    qrTimeoutMs: PropTypes.number,
    deviceLabel: PropTypes.string,
    deviceUuid: PropTypes.string,

    // abortTimeoutMs is the fallback when entitiesTimeoutMs / loginTimeoutMs
    // are not provided. Kept for backward compatibility.
    abortTimeoutMs: PropTypes.number,
    entitiesTimeoutMs: PropTypes.number,
    loginTimeoutMs: PropTypes.number,

    // Styling slots: each one is spread onto the corresponding child so the
    // consumer can match its own design system without a CSS override.
    containerProps: PropTypes.object,
    formProps: PropTypes.object,
    inputProps: PropTypes.object,
    passwordInputProps: PropTypes.object,
    selectProps: PropTypes.object,
    booleanProps: PropTypes.object,
    submitButtonProps: PropTypes.object,
    scanQrButtonProps: PropTypes.object,
    qrSeparatorProps: PropTypes.object,
    qrOverlayProps: PropTypes.object,
    errorAlertProps: PropTypes.object,
    qrErrorAlertProps: PropTypes.object,

    // Slot forwarded to the embedded <DevicePicker> that takes over the
    // render tree when the backend sends `needs_device_pick: true` after
    // a successful login. Useful to inject styling slots (containerProps,
    // formProps, labelInputProps, ...) or `onCancel` if a project wants
    // to allow bailing out of the picker.
    devicePickerProps: PropTypes.object,
    // Labels forwarded to <DevicePicker>. Merged with its DEFAULT_LABELS
    // by the picker itself, so partial overrides work.
    devicePickerLabels: PropTypes.object,

    labels: PropTypes.shape({
        emailLabel: PropTypes.string,
        emailPlaceholder: PropTypes.string,
        passwordLabel: PropTypes.string,
        passwordPlaceholder: PropTypes.string,
        entityLabel: PropTypes.string,
        entityPlaceholder: PropTypes.string,
        sharedDeviceLabel: PropTypes.string,
        submitLabel: PropTypes.string,
        scanQrLabel: PropTypes.string,
        qrSeparator: PropTypes.string,
        cancelQrLabel: PropTypes.string,
        scannerTitle: PropTypes.string,
        claimingMessage: PropTypes.string,
        pollingMessage: PropTypes.string,
        loginError: PropTypes.string,
        invalidQrError: PropTypes.string,
        claimError: PropTypes.string,
        pairingExpired: PropTypes.string,
        pairingCancelled: PropTypes.string,
        pairingTimeout: PropTypes.string,
        pairingAlreadyClaimed: PropTypes.string,
        pairingNotFound: PropTypes.string,
        rateLimited: PropTypes.string,
        requiredField: PropTypes.string,
        // Post-login device-pick error fallbacks. The label rendered
        // inside <DevicePicker> when api.linkUserDevice / createUserDevice
        // throws and the error has no `apiMessage` set.
        devicePickError: PropTypes.string,
        // Defensive: this should never trigger in practice since
        // useApi always wires the methods, but we still want a clean
        // message if a project mounts <LoginComponent> against a stub
        // useApi that's missing them.
        devicePickMissingApiError: PropTypes.string,
    }),
};

export const defaultProps = {
    showEntities: true,
    showSharedDevice: true,
    // QR pair is on by default: smartcommon assumes a smartAuth backend, and
    // smartAuth ships the /qr-pair endpoints. Pass false explicitly only if
    // your backend genuinely doesn't expose them.
    enableQrPair: true,
    qrPollIntervalMs: 2000,
    qrTimeoutMs: 120000,
    abortTimeoutMs: 15000,
    labels: {},
};

export const DEFAULT_LABELS = {
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "********",
    entityLabel: "Entity",
    entityPlaceholder: "Choose an entity",
    sharedDeviceLabel: "Shared or untrusted access: do not remember this account",
    submitLabel: "Sign in",
    scanQrLabel: "Scan a QR code",
    qrSeparator: "or",
    cancelQrLabel: "Cancel",
    scannerTitle: "Scan the pairing QR code",
    claimingMessage: "Connecting to the server...",
    pollingMessage: "Waiting for confirmation on the computer...",
    loginError: "Invalid credentials or network error.",
    invalidQrError: "This QR code does not match a valid pairing.",
    claimError: "Failed to claim the pairing.",
    pairingExpired: "This QR code has expired, request a new one.",
    pairingCancelled: "Pairing cancelled from the computer.",
    pairingTimeout: "Timeout exceeded, please try again.",
    pairingAlreadyClaimed: "This QR code has already been used. Request a new one from the computer.",
    pairingNotFound: "This QR code is no longer valid. Request a new one from the computer.",
    rateLimited: "Too many attempts. Wait a few moments before retrying.",
    requiredField: "This field is required.",
    devicePickError: "Failed to register this device. Check your connection and try again.",
    devicePickMissingApiError: "Missing configuration: the user-devices API is not available.",
};

// Default QR-pair error mapping. Inspects the thrown error and returns the
// best-matching label. Tries multiple error shapes to be robust:
//   - error.apiCode / error.apiMessage : set by our useApi beforeError hook
//   - error.response.status : ky HTTPError (raw HTTP status)
//   - error.status / error.code : generic fallbacks
export const buildDefaultGetQrErrorLabel = (labels) => (err) => {
    const status = err?.response?.status ?? err?.status;
    const code = err?.apiCode
        ?? err?.code
        ?? err?.response?.body?.error
        ?? err?.body?.error;

    if (code === "pairing_not_claimable" || status === 409) return labels.pairingAlreadyClaimed;
    if (code === "pairing_not_found"     || status === 404) return labels.pairingNotFound;
    if (code === "pairing_expired"       || status === 410) return labels.pairingExpired;
    if (code === "rate_limited"          || status === 429) return labels.rateLimited;
    if (code === "invalid_pairing_id"    || status === 400) return labels.invalidQrError;
    return labels.claimError;
};

// Extracts a 32-hex pairing_id from a scanned QR payload. Accepts:
//   - bare 32-hex string ("deadbeef..."*4)
//   - URL containing "/qrpair/{32hex}" or "/qr-pair/{32hex}"
//   - JSON-like text containing { pairing_id: "..." }
// Returns null if no valid id is found.
export const extractPairingId = (raw) => {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim().toLowerCase();
    if (/^[0-9a-f]{32}$/.test(trimmed)) return trimmed;
    const urlMatch = trimmed.match(/\/qr-?pair\/([0-9a-f]{32})/);
    if (urlMatch) return urlMatch[1];
    const jsonMatch = trimmed.match(/"?pairing_id"?\s*[:=]\s*"?([0-9a-f]{32})"?/);
    if (jsonMatch) return jsonMatch[1];
    return null;
};
