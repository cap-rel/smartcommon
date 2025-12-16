import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Timer = setTestStory({
    args: {
        label: "Duration",
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "formSubmitted", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "durationContainerProps", "DaysInput", "HoursInput", "MinutesInput", "SecondsInput"]
});
