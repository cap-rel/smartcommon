import PropTypes from "prop-types";

export const propTypes = {
    /** The app's i18next instance. */
    i18n: PropTypes.object.isRequired,
    /** Language code applied with i18n.changeLanguage() whenever it changes. */
    language: PropTypes.string,
    children: PropTypes.node,
};
