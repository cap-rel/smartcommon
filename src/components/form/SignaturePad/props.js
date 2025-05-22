import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.object,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    compressionOptions: PropTypes.object,
  
    name: PropTypes.string,
    defaultValue: PropTypes.object,
    value: PropTypes.object,
    onChangeValue: PropTypes.func,
  
    variant: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  
    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    labelProps: PropTypes.object,
    requiredStarProps: PropTypes.object,
    helpProps: PropTypes.object,
    headerAndSignaturePadContainerProps: PropTypes.object,
    headerProps: PropTypes.object,
    clearButtonProps: PropTypes.object,
    titleProps: PropTypes.object,
    validateButtonProps: PropTypes.object,
    signatureProps: PropTypes.object,
};