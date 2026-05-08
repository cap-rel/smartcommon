import PropTypes from "prop-types";

const iconShape = PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]);

export const propTypes = {
    value: iconShape,
    icon: iconShape,
    label: PropTypes.node,
    color: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
