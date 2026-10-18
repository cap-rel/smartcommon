import PropTypes from "prop-types";

export const propTypes = {
    // i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles).
    labels: PropTypes.object,
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    responsive: PropTypes.bool,
    sortProps: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    searchProps: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    children: PropTypes.node,
    containerProps: PropTypes.object,
    titleProps: PropTypes.object,
    controlsContainerProps: PropTypes.object,
    SearchInput: PropTypes.object,
    SortButton: PropTypes.object,
};

export const defaultProps = {
    pagination: false,
    sortProps: [],
    searchProps: [],
    responsive: true
};

export const DEFAULT_LABELS = {
    searchPlaceholder: "Search...",
};
