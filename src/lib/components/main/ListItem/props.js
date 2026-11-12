import PropTypes from "prop-types";

export const propTypes = {
    responsive: PropTypes.bool,
    /** Image URL rendered as the leading logo. */
    logo: PropTypes.string,
    /** Alt text for logo image (accessibility) */
    logoAlt: PropTypes.string,
    /** Icon builder () => node, rendered when no logo is provided. */
    icon: PropTypes.func,
    /** The item leads somewhere: shows the trailing pencil icon. */
    link: PropTypes.bool,
    /** Trailing icon after the title. true = pencil, a react-icons component
     * or an element = that icon, false = none (even with `link`). Shown only
     * when asked: `link` or this prop. */
    trailingIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.elementType, PropTypes.element]),
    /** Click handler: the item becomes a keyboard reachable button
     * (role="button", Enter and Space). Ignored for the element type when
     * `href` is set (the item is then a link that still calls onClick). */
    onClick: PropTypes.func,
    /** Renders the item as a real <a href>. */
    href: PropTypes.string,
    target: PropTypes.string,
    rel: PropTypes.string,
    /** Node rendered at the end of the title row. */
    status: PropTypes.node,
    title: PropTypes.node,
    subtitle: PropTypes.node,
    description: PropTypes.node,
    price: PropTypes.node,
    littleIcons: PropTypes.node,
    containerProps: PropTypes.object,
    trailingIconProps: PropTypes.object,
};

export const defaultProps = {
    responsive: true,
    logoAlt: "Logo",
    link: false,
};
