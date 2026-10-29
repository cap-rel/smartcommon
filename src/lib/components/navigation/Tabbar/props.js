import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
    responsive: PropTypes.bool,
    hideOnScroll: PropTypes.bool,
    /** Raised round action button in the middle of the tabs. `label` is its
     * accessible name (only the icon shows on mobile, the label too in the
     * desktop side menu); `badge` follows the counter rules. */
    centralButton: PropTypes.shape({
        icon: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        disabled: PropTypes.bool,
    }),
    tabbarProps: PropTypes.object,
    centralButtonContainerProps: PropTypes.object,
    centralButtonProps: PropTypes.object,
    centralButtonLabelProps: PropTypes.object,
    centralButtonBadgeProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    hideOnScroll: false
};