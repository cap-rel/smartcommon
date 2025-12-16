import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const UpperNavbarItem = setTestStory({
    args: {
        label: "Navigation Item",
    },
    props: propTypes,
    hidden: ["id", "icon", "children", "onClick"]
});
