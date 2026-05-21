import PropTypes from "prop-types";

export const propTypes = {
    type: PropTypes.oneOf(["search", "route"]),
    center: PropTypes.arrayOf(PropTypes.number),

    // i18n: merged shallowly over DEFAULT_LABELS.
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    searchPlaceholder: "Search a location...",
    noResults: "No result found.",
    routeStartPlaceholder: "Starting point...",
    routeEndPlaceholder: "Arrival point...",
    routeDurationConnector: "in",
};
