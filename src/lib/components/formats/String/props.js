import PropTypes from "prop-types";

export const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    underline: PropTypes.bool,
    uppercase: PropTypes.bool,
    italic: PropTypes.bool,
    bold: PropTypes.bool,
};
