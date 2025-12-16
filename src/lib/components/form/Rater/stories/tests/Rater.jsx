import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Rater = setTestStory({
    args: {
        label: "Rate your experience",
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "ratingIcon", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "ratingContainerProps", "optionProps", "checkedIconProps"]
});
