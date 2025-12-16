import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Select = setTestStory({
    args: {
        label: "Choose a country",
        options: [
            { value: "fr", label: "France" },
            { value: "us", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "de", label: "Germany" }
        ]
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "selectProps", "optionProps"]
});
