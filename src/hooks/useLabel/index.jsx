export const useLabel = (props) => {
    const labelProps = {
        id: props.id,
        label: props.label,
        help: props.help,
        prefix: props.prefix,
        suffix: props.suffix,
        required: props.required,
        disabled: props.disabled,
        readOnly: props.readOnly,
        variant: props.variant,
        containerProps: props.containerProps,
        labelContainerProps: props.labelContainerProps,
        labelProps: props.labelProps,
        starProps: props.starProps,
        prefixProps: props.prefixProps,
        suffixProps: props.suffixProps,
        childrenProps: props.childrenProps,
        helpProps: props.helpProps,
    }

    delete props.label;
    delete props.help;
    delete props.prefix;
    delete props.suffix;
    delete props.containerProps;
    delete props.labelContainerProps;
    delete props.labelProps;
    delete props.starProps;
    delete props.prefixProps;
    delete props.suffixProps;
    delete props.childrenProps;
    delete props.helpProps

    return { extractedLabelProps: labelProps, filteredProps: props };
}