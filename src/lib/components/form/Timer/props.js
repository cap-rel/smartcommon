import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,

    showSeconds: PropTypes.bool,
    maxDays: PropTypes.number,

    name: PropTypes.string,
    value: PropTypes.number,
    onChange: PropTypes.func,
    defaultValue: PropTypes.number,

    formSubmitted: PropTypes.bool,
    onError: PropTypes.func,

    // Label slots
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    starProps: PropTypes.object,
    childrenContainerProps: PropTypes.object,
    prefixProps: PropTypes.object,
    suffixProps: PropTypes.object,
    helpIconProps: PropTypes.object,
    helpAndErrorsContainerProps: PropTypes.object,
    helpProps: PropTypes.object,
    errorProps: PropTypes.object,

    // Timer slots
    durationContainerProps: PropTypes.object,
    separatorProps: PropTypes.object,
    cellProps: PropTypes.object,
    dropdownProps: PropTypes.object,
    columnsContainerProps: PropTypes.object,
    columnProps: PropTypes.object,
    columnHeaderProps: PropTypes.object,
    columnListProps: PropTypes.object,
    optionProps: PropTypes.object,
    footerProps: PropTypes.object,
    okButtonProps: PropTypes.object,
};
