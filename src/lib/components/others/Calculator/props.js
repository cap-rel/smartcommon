import PropTypes from "prop-types";

export const propTypes = {
    // Main props
    id: PropTypes.string,
    isOpen: PropTypes.bool,
    onOpenChange: PropTypes.func,
    onResult: PropTypes.func,
    onClose: PropTypes.func,

    // Appearance
    position: PropTypes.oneOf([
        "bottom-right",
        "bottom-left",
        "bottom-center",
        "center",
        "top-right",
        "top-left",
    ]),
    title: PropTypes.string,
    zIndex: PropTypes.number,
    showFab: PropTypes.bool,
    showOverlay: PropTypes.bool,
    showHistory: PropTypes.bool,
    showMemory: PropTypes.bool,
    fabIcon: PropTypes.elementType,

    // Behavior
    closeOnResult: PropTypes.bool,

    // Sub-component props
    Overlay: PropTypes.object,
    Button: PropTypes.object,
    fabProps: PropTypes.object,
    backdropProps: PropTypes.object,
    calculatorProps: PropTypes.object,
    headerProps: PropTypes.object,
    displayProps: PropTypes.object,
    historyProps: PropTypes.object,
    memoryButtonsProps: PropTypes.object,
    buttonsProps: PropTypes.object,
};

export const defaultProps = {
    position: "bottom-right",
    title: "Calculator",
    zIndex: 40,
    showFab: true,
    showOverlay: true,
    showHistory: true,
    showMemory: true,
    closeOnResult: false,
};
