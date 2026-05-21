import PropTypes from "prop-types";

export const propTypes = {
    type: PropTypes.oneOf(["search", "route"]),
    center: PropTypes.arrayOf(PropTypes.number),

    // i18n: merged shallowly over DEFAULT_LABELS.
    labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
    searchPlaceholder: "Rechercher un lieu...",
    noResults: "Aucun résultat trouvé.",
    routeStartPlaceholder: "Point de départ...",
    routeEndPlaceholder: "Point d'arrivée...",
    routeDurationConnector: "en",
};
