import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.oneOf("int", "stock", "reel", "price", "pricey"),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    className: PropTypes.string,
    color: PropTypes.string
};