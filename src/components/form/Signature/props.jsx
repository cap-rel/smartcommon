import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    rows: PropTypes.number,
    settings: PropTypes.object,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,   
    className: PropTypes.string,
    color: PropTypes.string
};