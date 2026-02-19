import PropTypes from "prop-types";

export const propTypes = {
    // Main props
    id: PropTypes.string,
    icon: PropTypes.elementType,
    label: PropTypes.string,
    onClick: PropTypes.func,

    // Appearance
    position: PropTypes.oneOf([
        "bottom-right",
        "bottom-left",
        "bottom-center",
        "top-right",
        "top-left",
        "top-center",
    ]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    color: PropTypes.oneOf(["primary", "secondary", "tertiary", "neutral"]),
    zIndex: PropTypes.number,

    // Speed-dial mode
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.elementType.isRequired,
            label: PropTypes.string,
            onClick: PropTypes.func,
            color: PropTypes.oneOf(["primary", "secondary", "tertiary", "neutral"]),
        })
    ),
    direction: PropTypes.oneOf(["up", "down", "left", "right"]),
    isOpen: PropTypes.bool,
    onOpenChange: PropTypes.func,

    // Sub-component props
    fabProps: PropTypes.object,
    actionProps: PropTypes.object,
    labelProps: PropTypes.object,
};

export const defaultProps = {
    position: "bottom-right",
    size: "md",
    color: "primary",
    zIndex: 50,
    direction: "up",
};
