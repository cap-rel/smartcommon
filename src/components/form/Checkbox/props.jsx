import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    name: PropTypes.string.isRequired,
    min: PropTypes.number,
    size: PropTypes.number,
    max: PropTypes.number,
    options: PropTypes.array.isRequired,
    multiple: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,   
    className: PropTypes.string,
    color: PropTypes.string
};