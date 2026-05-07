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
    showRememberMe: PropTypes.bool,

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
    errorAlertProps: PropTypes.object,
    qrErrorAlertProps: PropTypes.object,

    labels: PropTypes.shape({
        emailLabel: PropTypes.string,
        emailPlaceholder: PropTypes.string,
        passwordLabel: PropTypes.string,
        passwordPlaceholder: PropTypes.string,
        entityLabel: PropTypes.string,
        entityPlaceholder: PropTypes.string,
        rememberMeLabel: PropTypes.string,
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
    }),
};

export const defaultProps = {
    showEntities: true,
    showRememberMe: false,
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
    emailPlaceholder: "votre@email.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "••••••••",
    entityLabel: "Entité",
    entityPlaceholder: "Choisir une entité",
    rememberMeLabel: "Se souvenir de moi",
    submitLabel: "Se connecter",
    scanQrLabel: "Scanner un QR code",
    qrSeparator: "ou",
    cancelQrLabel: "Annuler",
    scannerTitle: "Scanner le QR code de pairing",
    claimingMessage: "Connexion au serveur...",
    pollingMessage: "En attente de la confirmation sur l'ordinateur...",
    loginError: "Identifiants invalides ou erreur réseau.",
    invalidQrError: "Ce QR code ne correspond pas à un pairing valide.",
    claimError: "Impossible de revendiquer le pairing.",
    pairingExpired: "Ce QR code a expiré, demandez-en un nouveau.",
    pairingCancelled: "Pairing annulé depuis l'ordinateur.",
    pairingTimeout: "Délai d'attente dépassé, réessayez.",
    pairingAlreadyClaimed: "Ce QR code a déjà été utilisé. Demandez-en un nouveau sur l'ordinateur.",
    pairingNotFound: "Ce QR code n'est plus valide. Demandez-en un nouveau sur l'ordinateur.",
    rateLimited: "Trop de tentatives. Patientez quelques instants avant de réessayer.",
    requiredField: "Ce champ est requis.",
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
