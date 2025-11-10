import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
};

export const defaultProps = {
    responsive: true
};