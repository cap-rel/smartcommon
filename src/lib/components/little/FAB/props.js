import PropTypes from "prop-types";

export const propTypes = {
    /** react-icons component rendered at `iconSize` px (e.g. icon={FaPlus}) */
    icon: PropTypes.elementType,
    /** Click handler (ignored when `actions` are provided) */
    onClick: PropTypes.func,
    /** Themed background: "primary" | "secondary" */
    color: PropTypes.oneOf(["primary", "secondary"]),
    /** Circle diameter in px */
    size: PropTypes.number,
    /** Glyph size in px */
    iconSize: PropTypes.number,
    /** Anchor corner: "bottom-right" | "bottom-left" */
    position: PropTypes.oneOf(["bottom-right", "bottom-left"]),
    /** Rendered instead of `icon` when no icon is provided */
    children: PropTypes.node,
    /** Accessible name for the main button */
    label: PropTypes.string,

    /** Speed-dial entries. Non-empty turns the FAB into a speed-dial menu. */
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.elementType.isRequired,
            label: PropTypes.string,
            onClick: PropTypes.func,
            color: PropTypes.oneOf(["primary", "secondary", "neutral"]),
        })
    ),
    /** Speed-dial fan-out direction */
    direction: PropTypes.oneOf(["up", "down", "left", "right"]),
    /** Controlled speed-dial open state (with onOpenChange) */
    isOpen: PropTypes.bool,
    /** Called with the next open state when controlled */
    onOpenChange: PropTypes.func,

    /** Styling slots */
    buttonProps: PropTypes.object,
    containerProps: PropTypes.object,
    actionProps: PropTypes.object,
    actionLabelProps: PropTypes.object,
};

export const defaultProps = {
    color: "secondary",
    size: 64,
    iconSize: 32,
    position: "bottom-right",
    direction: "up",
};
