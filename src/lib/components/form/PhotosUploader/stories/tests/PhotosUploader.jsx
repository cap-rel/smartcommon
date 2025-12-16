import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const PhotosUploader = setTestStory({
    args: {
        label: "Upload photos",
        multiple: true,
        defaultValue: []
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "accept", "compressOptions", "value", "defaultValue", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "photosAndButtonContainerProps", "photosContainerProps", "emptyPhotoProps", "buttonsContainerProps", "CaptureButton", "ImportButton", "photoProps", "imgProps", "titleProps", "Popup", "popupImgProps", "TitleInput", "DescriptionTextarea", "DeleteButton"]
});
