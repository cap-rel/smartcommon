import PropTypes from "prop-types";

import { menuItemShape } from "lib/components/others/Dropdown/props";

export const propTypes = {
    /** The object returned by useContextMenu(). */
    state: PropTypes.shape({
        isOpen: PropTypes.bool,
        x: PropTypes.number,
        y: PropTypes.number,
        items: PropTypes.arrayOf(menuItemShape),
        close: PropTypes.func,
        returnFocusTo: PropTypes.object,
    }),
    zIndex: PropTypes.number,
    /** data-testid of the menu. */
    testId: PropTypes.string,
    /** i18n: merged shallowly over DEFAULT_LABELS (see the locale bundles). */
    labels: PropTypes.shape({
        menu: PropTypes.string,
    }),

    menuProps: PropTypes.object,
    itemProps: PropTypes.object,
    dividerProps: PropTypes.object,
};

export const defaultProps = {
    zIndex: 60,
    testId: "context-menu",
};

export const DEFAULT_LABELS = {
    // Accessible name of the menu.
    menu: "Actions",
};
