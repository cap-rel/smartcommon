import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const AddressInput = setTestStory({
    args: {
        label: "Address",
    },
    props: propTypes,
    hidden: ["containerProps", "labelContainerProps", "labelProps", "requiredStarProps", "helpProps", "inputContainerProps", "inputProps", "inputSpinnerProps", "inputIconProps", "listProps", "listItemProps"]
});
