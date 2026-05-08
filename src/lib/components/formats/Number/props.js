import PropTypes from "prop-types";

export const propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    locale: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    style: PropTypes.oneOf(["decimal", "currency", "percent", "unit"]),
    currency: PropTypes.string,
    minimumFractionDigits: PropTypes.number,
    maximumFractionDigits: PropTypes.number,
    options: PropTypes.object,
};
