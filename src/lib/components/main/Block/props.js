import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    title: PropTypes.string,
    header: PropTypes.string,
    footer: PropTypes.string,
    containerProps: PropTypes.object,
    titleProps: PropTypes.object,
    headerProps: PropTypes.object,
    blockProps: PropTypes.object,
    footerProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true
};