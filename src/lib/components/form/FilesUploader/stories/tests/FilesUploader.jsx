import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const FilesUploader = setTestStory({
    args: {
        label: "Upload documents",
        multiple: true,
    },
    props: propTypes,
    hidden: ["id", "onValueChange", "containerProps", "labelContainerProps", "labelProps", "requiredStarProps", "helpProps", "inputProps", "listAndButtonsContainerProps", "listProps", "listItemProps", "urlInputProps", "typeInputProps", "iconProps", "titleProps", "typeProps", "deleteButtonProps", "deleteButtonIconProps", "panelProps", "fileProps", "titleInputProps", "descriptionInputProps", "buttonProps", "buttonSpinnerProps", "buttonIconProps", "buttonLabelProps"]
});
