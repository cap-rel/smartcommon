import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Checker = setTestStory({
    args: {
        label: "Select your preferences",
        options: [
            { value: "newsletter", label: "Newsletter" },
            { value: "updates", label: "Product updates" }
        ],
        type: "checkbox"
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "checkedIcon", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "optionsContainerProps", "optionProps", "optionLabelProps", "switchProps", "switchCircleProps", "checkboxProps", "checkboxIconProps", "radioProps", "checkedIconProps"]
});
