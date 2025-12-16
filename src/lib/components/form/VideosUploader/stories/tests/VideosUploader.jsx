import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const VideosUploader = setTestStory({
    args: {
        label: "Upload Videos",
        multiple: true
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "value", "defaultValue", "formSubmitted", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "videosAndButtonContainerProps", "videosContainerProps", "emptyVideoProps", "buttonsContainerProps", "CaptureButton", "ImportButton", "videoProps", "imgProps", "titleProps", "Popup", "videoPlayerProps", "TitleInput", "DescriptionTextarea", "DeleteButton"]
});
