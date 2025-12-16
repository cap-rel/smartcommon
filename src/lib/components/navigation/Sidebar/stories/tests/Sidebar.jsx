import { FaHouse, FaGear } from "react-icons/fa6";
import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Sidebar = setTestStory({
    args: {
        links: [
            { label: "Home", icon: FaHouse },
            { label: "Settings", icon: FaGear }
        ]
    },
    props: propTypes,
    hidden: ["id", "open", "children", "Panel", "Button", "linkProps", "iconAndLabelContainerProps", "iconProps", "badgeProps", "labelProps"]
});
