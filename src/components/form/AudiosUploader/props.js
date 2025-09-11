import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,

    label: PropTypes.string,
    help: PropTypes.string,
    icon: PropTypes.node,
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    accept: PropTypes.string,

    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    min: PropTypes.number,
    exact: PropTypes.number,
    max: PropTypes.number,
    multiple: PropTypes.bool,

    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    defaultValue: PropTypes.bool,

    formSubmitted: PropTypes.bool,
    onError: PropTypes.func,

    containerProps: PropTypes.object,
    labelContainerProps: PropTypes.object,
    iconProps: PropTypes.object,
    labelProps: PropTypes.object,
    starProps: PropTypes.object,
    childrenContainerProps: PropTypes.object,
    prefixProps: PropTypes.object,
    suffixProps: PropTypes.object,
    footerProps: PropTypes.object,
    helpIconProps: PropTypes.object,
    helpAndErrorsContainerProps: PropTypes.object,
    helpProps: PropTypes.object,
    errorProps: PropTypes.object,
    
    audiosAndButtonContainerProps: PropTypes.object,
    audiosContainerProps: PropTypes.object,
    emptyAudioProps: PropTypes.object,
    buttonsContainerProps: PropTypes.object,
    CaptureButton: PropTypes.object,
    ImportButton: PropTypes.object,
    audioProps: PropTypes.object,
    imgProps: PropTypes.object,
    titleProps: PropTypes.object,
    Popup: PropTypes.object,
    popupImg: PropTypes.object,
    audioPlayerProps: PropTypes.object,
    TitleInput: PropTypes.object,
    DescriptionTextarea: PropTypes.object,
    DeleteButton: PropTypes.object,
};