import PropTypes from "prop-types";

export const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            years: PropTypes.number,
            months: PropTypes.number,
            weeks: PropTypes.number,
            days: PropTypes.number,
            hours: PropTypes.number,
            minutes: PropTypes.number,
            seconds: PropTypes.number,
            milliseconds: PropTypes.number,
        }),
    ]),
    locale: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    style: PropTypes.oneOf(["long", "short", "narrow", "digital"]),
    options: PropTypes.object,
};
