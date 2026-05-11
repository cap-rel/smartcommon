import PropTypes from "prop-types";

export const stepShape = PropTypes.shape({
    label: PropTypes.node,
    description: PropTypes.node,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
    status: PropTypes.oneOf(["completed", "current", "upcoming", "error"]),
});

export const propTypes = {
    steps: PropTypes.arrayOf(stepShape),
    currentStep: PropTypes.number,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]),
    onStepClick: PropTypes.func,
    labels: PropTypes.shape({
        stepN: PropTypes.func,
    }),

    // Element slots (className-only merge through useVariantMerger).
    containerProps: PropTypes.object,
    stepProps: PropTypes.object,
    stepIndicatorProps: PropTypes.object,
    stepIconProps: PropTypes.object,
    stepLabelProps: PropTypes.object,
    stepDescriptionProps: PropTypes.object,
    stepConnectorProps: PropTypes.object,
};

export const defaultProps = {
    steps: [],
    currentStep: 0,
    orientation: "horizontal",
};

// Default user-facing labels. French with proper accents.
export const DEFAULT_LABELS = {
    stepN: (n) => `Étape ${n}`,
};
