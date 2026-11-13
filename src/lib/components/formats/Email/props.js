import PropTypes from "prop-types";

export const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    linkProps: PropTypes.object,
    iconProps: PropTypes.object,
    emailProps: PropTypes.object,
};
