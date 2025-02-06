import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    name: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["select", "switch", "checkbox", "radio", "button", "star", "heart"]),
    options: PropTypes.array.isRequired,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,   
    custom: PropTypes.object,
};