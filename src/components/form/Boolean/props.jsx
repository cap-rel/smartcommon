import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    variant: PropTypes.oneOf(["switch", "checkbox", "star", "heart", "radio"]),
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.bool.isRequired, 
    onChange: PropTypes.func,   
    className: PropTypes.string,
    color: PropTypes.string
};
