export const useLabel = (props) => {
    const labelProps = {
        label: props.label,
        help: props.help,
        prefix: props.prefix,
        suffix: props.suffix,
        id: props.inputProps?.id,
        required: props.required ?? props.inputProps?.required,
        disabled: props.disabled ?? props.inputProps?.disabled,
        readOnly: props.readOnly ?? props.inputProps?.readOnly,
        variant: props.variant,
        containerProps: props.containerProps,
        labelContainerProps: props.labelContainerProps,
        labelProps: props.labelProps,
        starProps: props.starProps,
        childrenContainerProps: props.childrenProps,
        prefixProps: props.prefixProps,
        suffixProps: props.suffixProps,
        helpProps: props.helpProps,
    }

    delete props.label;
    delete props.help;
    delete props.prefix;
    delete props.suffix;
    delete props.containerProps;
    delete props.labelContainerProps;
    delete props.labelProps;
    delete props.childrenContainerProps;
    delete props.starProps;
    delete props.prefixProps;
    delete props.suffixProps;
    delete props.helpProps

    return { extractedLabelProps: labelProps, filteredProps: props };
}