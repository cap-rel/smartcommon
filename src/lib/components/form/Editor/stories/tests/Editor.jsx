import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Editor = setTestStory({
    args: {
        label: "Article content",
    },
    props: propTypes,
    hidden: ["id", "onValueChange", "containerProps", "labelContainerProps", "labelProps", "requiredStarProps", "helpProps", "textareaContainerProps", "textareaProps", "htmlProps", "buttonContainerProps", "mdButtonProps", "mdButtonIconProps", "mdButtonLabelProps", "htmlButtonProps", "htmlButtonIconProps", "htmlButtonLabelProps"]
});
