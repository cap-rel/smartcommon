import { FaUser } from "react-icons/fa6";
import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const IconButton = setTestStory({
    args: {
        icon: FaUser
    },
    props: propTypes,
    hidden: ["id", "label", "icon", "children", "onClick", "buttonProps", "Spinner", "iconProps", "labelProps", "badgeProps"]
});
