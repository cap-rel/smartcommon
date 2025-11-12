import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    responsive: PropTypes.bool,
    sortProps: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    searchProps: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    children: PropTypes.node,
    containerProps: PropTypes.object,
    titleProps: PropTypes.object,
    controlsContainer: PropTypes.object,
    SearchInput: PropTypes.object,
    SortButton: PropTypes.object,
    paginationContainerProps: PropTypes.object,
};

export const defaultProps = {
    pagination: false,
    sortProps: [],
    searchProps: [],
    responsive: true
};