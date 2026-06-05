import PropTypes from "prop-types";

// Default map data sources. Hoisted so consumers can opt into a different tile
// server / geocoder (self-hosted, paid provider, ...) without forking the
// component, instead of these URLs being hardcoded in the render path.
export const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const DEFAULT_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const DEFAULT_REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";

export const propTypes = {
    type: PropTypes.oneOf(["search", "route"]),
    center: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,

    // Data sources (default to OpenStreetMap / Nominatim).
    tileUrl: PropTypes.string,
    tileAttribution: PropTypes.string,
    reverseGeocodeUrl: PropTypes.string,

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
