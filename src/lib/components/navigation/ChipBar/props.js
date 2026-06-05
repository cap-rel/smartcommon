import PropTypes from "prop-types";

export const propTypes = {
    /** Variant(s) passed to useVariantMerger */
    variant: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string, PropTypes.object]),

    /**
     * Filter chips. Each entry:
     * - key: stable identity (used for React key + data-testid)
     * - label: visible text
     * - count: number shown in parentheses (defaults to 0)
     * - active: filled (true) vs outlined (false)
     * - onClick: click handler
     * - hidden: not rendered at all when true
     * - disabled: dimmed (still clickable per spec)
     * - variant: "status" renders a squared sub-filter instead of a pill
     * - icon: optional leading icon component
     * - activeClassName / inactiveClassName: override palette (status colors)
     */
    chips: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.node,
        count: PropTypes.number,
        active: PropTypes.bool,
        onClick: PropTypes.func,
        hidden: PropTypes.bool,
        disabled: PropTypes.bool,
        variant: PropTypes.string,
        icon: PropTypes.elementType,
        activeClassName: PropTypes.string,
        inactiveClassName: PropTypes.string,
    })),

    /** Container slot (variantMerger) */
    containerProps: PropTypes.object,
};

export const defaultProps = {
    chips: [],
};
