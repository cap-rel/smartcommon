import PropTypes from "prop-types";

export const propTypes = {
    responsive: PropTypes.bool,
    /** Image URL rendered as the leading logo. */
    logo: PropTypes.string,
    /** Alt text for logo image (accessibility) */
    logoAlt: PropTypes.string,
    /** Icon builder () => node, rendered when no logo is provided. */
    icon: PropTypes.func,
    link: PropTypes.bool,
    /** Node rendered at the end of the title row. */
    status: PropTypes.node,
    title: PropTypes.node,
    subtitle: PropTypes.node,
    description: PropTypes.node,
    price: PropTypes.node,
    littleIcons: PropTypes.node,
};

export const defaultProps = {
    responsive: true,
    logoAlt: "Logo",
    link: false,
};
