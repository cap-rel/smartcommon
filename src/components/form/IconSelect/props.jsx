import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    placeholder: PropTypes.string,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,   
    className: PropTypes.string,
    color: PropTypes.string
};
