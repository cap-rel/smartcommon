import PropTypes from "prop-types";

export const propTypes = {
    /** The application. */
    children: PropTypes.node,
    /** Library configuration, shared through LibConfigProvider (see the config keys below). */
    config: PropTypes.object,
    /** Called with (error, errorInfo) when the root ErrorBoundary catches an error. */
    onError: PropTypes.func,
    /** Element shown instead of the app after an uncaught error. */
    errorFallback: PropTypes.node,
    /** Component rendered with ({ error, resetError }), takes priority over errorFallback. */
    ErrorFallbackComponent: PropTypes.elementType,
    /** Texts of the default error screen, e.g. locales.fr.ErrorBoundary. */
    errorLabels: PropTypes.object,
    /** When set, mounts <UpdatePrompt {...pwaUpdate} />. */
    pwaUpdate: PropTypes.object,
    /** Mounts the on-page debug console and warnings. Keep it off in production. */
    debug: PropTypes.bool,
};
