import PropTypes from "prop-types";

export const propTypes = {
    children: PropTypes.node.isRequired,
    /** Element shown instead of the children after an error. */
    fallback: PropTypes.node,
    /** Component ({ error, resetError }) shown after an error, takes priority over `fallback`. */
    FallbackComponent: PropTypes.elementType,
    /** Called with (error, errorInfo) once the error is logged. */
    onError: PropTypes.func,
    /** i18n of the default fallback: merged shallowly over DEFAULT_LABELS
     * (see the locale bundles). */
    labels: PropTypes.shape({
        title: PropTypes.string,
        unknownError: PropTypes.string,
        retry: PropTypes.string,
    }),
};

export const DEFAULT_LABELS = {
    title: "Something went wrong",
    unknownError: "Unknown error",
    retry: "Try again",
};
