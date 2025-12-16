import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const LowerNavbarItem = setTestStory({
    args: {
        label: "Home",
    },
    props: propTypes,
    hidden: ["id", "icon", "activeIcon", "onClick", "containerProps", "iconProps", "labelProps"]
});
