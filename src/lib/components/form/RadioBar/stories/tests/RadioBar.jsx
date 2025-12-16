import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const RadioBar = setTestStory({
    args: {
        label: "Select your option",
        options: [
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" }
        ]
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "optionsContainerProps", "optionProps"]
});
