export const useLabel = (props, idKey) => {
    const labelProps = {
        label: props.label,
        help: props.help,
        icon: props.icon,
        prefix: props.prefix,
        suffix: props.suffix,
        // id: props[idKey]?.id,
        required: props.required,
        disabled: props.disabled,
        readOnly: props.readOnly,
        containerProps: props.containerProps,
        labelContainerProps: props.labelContainerProps,
        iconProps: props.iconProps,
        labelProps: props.labelProps,
        starProps: props.starProps,
        childrenContainerProps: props.childrenProps,
        prefixProps: props.prefixProps,
        suffixProps: props.suffixProps,
        helpContainerProps: props.suffixProps,
        helpIconProps: props.helpIconProps,
        helpProps: props.helpProps,
    }

    // delete props.label;
    // delete props.help;
    // delete props.prefix;
    // delete props.suffix;
    // delete props.containerProps;
    // delete props.labelContainerProps;
    // delete props.labelProps;
    // delete props.childrenContainerProps;
    // delete props.starProps;
    // delete props.prefixProps;
    // delete props.suffixProps;
    // delete props.helpProps

    return { extractedLabelProps: labelProps, filteredProps: props };
}