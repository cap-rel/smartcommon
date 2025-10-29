import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Button = setTestStory({
    args: {
        label: "Create an account",
    },
    props: propTypes,
    hidden: ["id", "icon", "children", "onClick", "buttonProps", "Spinner", "iconProps", "labelProps", "badgeProps"]
});
