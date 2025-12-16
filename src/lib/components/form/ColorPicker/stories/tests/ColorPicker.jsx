import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const ColorPicker = setTestStory({
    args: {
        label: "Choose a color",
        defaultValue: "#3b82f6",
    },
    props: propTypes,
    hidden: ["id", "icon", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "inputProps"]
});
