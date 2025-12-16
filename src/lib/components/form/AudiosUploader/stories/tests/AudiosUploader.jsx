import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const AudiosUploader = setTestStory({
    args: {
        label: "Upload your audio files",
        multiple: true,
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "defaultValue", "formSubmitted", "value", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "audiosAndButtonContainerProps", "audiosContainerProps", "emptyAudioProps", "buttonsContainerProps", "CaptureButton", "ImportButton", "audioProps", "imgProps", "titleProps", "Popup", "popupImg", "audioPlayerProps", "TitleInput", "DescriptionTextarea", "DeleteButton"]
});
