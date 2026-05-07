import PropTypes from "prop-types";

export const propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func,

    showEntities: PropTypes.bool,
    showRememberMe: PropTypes.bool,

    enableQrPair: PropTypes.bool,
    qrPollIntervalMs: PropTypes.number,
    qrTimeoutMs: PropTypes.number,
    deviceLabel: PropTypes.string,
    deviceUuid: PropTypes.string,

    abortTimeoutMs: PropTypes.number,

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
        requiredField: PropTypes.string,
    }),
};

export const defaultProps = {
    showEntities: true,
    showRememberMe: false,
    enableQrPair: false,
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
    requiredField: "Ce champ est requis.",
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
