import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    responsive: PropTypes.bool,
    animations: PropTypes.object,
    children: PropTypes.node,
    pageProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true
};