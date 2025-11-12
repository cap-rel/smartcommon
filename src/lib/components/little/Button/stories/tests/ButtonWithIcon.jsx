import { FaUser } from "react-icons/fa6";
import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const ButtonWithIcon = setTestStory({
    args: {
        label: "Create an account",
        icon: FaUser
    },
    props: propTypes,
    hidden: ["id", "icon", "children", "onClick", "buttonProps", "Spinner", "iconProps", "labelProps", "badgeProps"]
});
