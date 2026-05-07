import PropTypes from "prop-types";

export const propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    appName: PropTypes.string.isRequired,
    version: PropTypes.string,
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.node,
        })
    ),
    labels: PropTypes.shape({
        title: PropTypes.string,
        application: PropTypes.string,
        version: PropTypes.string,
        close: PropTypes.string,
        checkUpdates: PropTypes.string,
        checking: PropTypes.string,
        upToDate: PropTypes.string,
        updating: PropTypes.string,
        installUpdate: PropTypes.string,
        updatesNotSupported: PropTypes.string,
        checkError: PropTypes.string,
    }),
};

export const defaultProps = {
    fields: [],
    labels: {},
};

export const DEFAULT_LABELS = {
    title: "À propos",
    application: "Application",
    version: "Version",
    close: "Fermer",
    checkUpdates: "Vérifier les mises à jour",
    checking: "Vérification...",
    upToDate: "Application à jour",
    updating: "Mise à jour...",
    installUpdate: "Installer la mise à jour",
    updatesNotSupported: "Mises à jour non supportées sur ce navigateur",
    checkError: "Erreur lors de la vérification",
};
