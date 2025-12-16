import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Range = setTestStory({
    args: {
        label: "Brightness",
        rangeMin: 0,
        rangeMax: 100,
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onChange", "onError", "formSubmitted", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "rangeContainerProps", "inputProps", "valueProps"]
});
