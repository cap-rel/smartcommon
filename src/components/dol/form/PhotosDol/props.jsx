import PropTypes from "prop-types";

export const propTypes = {
    label: PropTypes.string, 
    id: PropTypes.string,
    help: PropTypes.string,
    min: PropTypes.number,
    size: PropTypes.number,
    max: PropTypes.number,
    multiple: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.shape({
            title: PropTypes.string,
            description: PropTypes.string,
            src: PropTypes.string
        }),
        PropTypes.arrayOf(
            PropTypes.shape({
                title: PropTypes.string,
                description: PropTypes.string,
                src: PropTypes.string
            }),
        ),
    ]).isRequired, 
    onChange: PropTypes.func,   
    className: PropTypes.string,
    color: PropTypes.string
};
