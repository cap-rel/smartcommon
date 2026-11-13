import PropTypes from "prop-types";

// Drawn control of a Boolean / Checker option. It is not used on its own:
// the parent passes `mergeProps` from its useVariantMerger, which resolves
// the slots below from the parent's props and variants.
export const propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    mergeProps: PropTypes.func.isRequired,

    // Slots, read through the parent's mergeProps
    radioProps: PropTypes.object,
};
