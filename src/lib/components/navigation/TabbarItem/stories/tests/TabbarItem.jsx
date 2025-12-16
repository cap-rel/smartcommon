import { FaHouse } from "react-icons/fa6";
import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const TabbarItem = setTestStory({
    args: {
        icon: FaHouse,
        label: "Home",
    },
    props: propTypes,
    hidden: ["id", "icon", "activeIcon", "onClick", "containerProps", "iconAndLabelContainerProps", "iconProps", "labelProps"]
});
