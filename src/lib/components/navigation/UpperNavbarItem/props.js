import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    badge: PropTypes.node,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    label: PropTypes.node,
    /** Called on click (chained after linkProps.onClick when both exist). */
    onClick: PropTypes.func,
    children: PropTypes.node,

    linkProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
};

export const defaultProps = {};
