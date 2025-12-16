import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Boolean = setTestStory({
    args: {
        label: "Accept terms and conditions",
        type: "switch"
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "checkedIcon", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "switchProps", "switchCircleProps", "checkboxProps", "checkboxIconProps", "radioProps", "checkedIconProps"]
});
