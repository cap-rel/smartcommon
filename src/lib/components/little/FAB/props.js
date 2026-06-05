import PropTypes from "prop-types";

export const propTypes = {
    /** react-icons component rendered at `iconSize` px (e.g. icon={FaPlus}) */
    icon: PropTypes.elementType,
    /** Click handler */
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
};

export const defaultProps = {
    color: "secondary",
    size: 64,
    iconSize: 32,
    position: "bottom-right",
};
