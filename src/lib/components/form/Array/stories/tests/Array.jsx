import { setTestStory } from "../../../../../../storybook";
import { arrayPropTypes } from "../../props";

export const Array = setTestStory({
    args: {
        label: "Tags",
    },
    props: arrayPropTypes,
    hidden: ["id", "icon", "prefix", "suffix", "onValueChange", "containerProps", "labelContainerProps", "labelProps", "starProps", "requiredStarProps", "helpProps", "childrenContainerProps", "prefixProps", "suffixProps", "arrayContainerProps", "arrayInputProps", "tagsContainerProps", "tagProps", "inputProps"]
});
