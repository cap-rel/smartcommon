import PropTypes from "prop-types";

// Menu entry shared by Dropdown and ContextMenu.
export const menuItemShape = PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.node,
    icon: PropTypes.node,
    onClick: PropTypes.func,
    danger: PropTypes.bool,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    testId: PropTypes.string,
});

export const propTypes = {
    /** Menu entries: { label, icon?, onClick?, danger?, disabled?, divider? }. */
    items: PropTypes.arrayOf(menuItemShape),
    /** Element, render function ({ open, toggle, triggerProps }) => node, or node. */
    trigger: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** Menu edge aligned on the trigger: "right" (default) or "left". */
    align: PropTypes.oneOf(["left", "right"]),
    /** Extra classes on the menu. */
    menuClassName: PropTypes.string,
    /** Prefix of the menu data-testid (`${testId}-menu`). */
    testId: PropTypes.string,
    zIndex: PropTypes.number,

    /** Inline wrapper of the trigger (positioning anchor). */
    triggerWrapperProps: PropTypes.object,
    menuProps: PropTypes.object,
    itemProps: PropTypes.object,
    dividerProps: PropTypes.object,
};

export const defaultProps = {
    items: [],
    align: "right",
    menuClassName: "",
    testId: "dropdown",
    zIndex: 50,
};
