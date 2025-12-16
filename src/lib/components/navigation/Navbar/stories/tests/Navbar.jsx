import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Navbar = setTestStory({
    args: {
        id: "navbar",
        title: "Test Navbar",
    },
    props: propTypes,
    hidden: ["id", "children", "left", "right", "bottom", "navbarProps", "upperNavbarProps", "leftContainerProps", "titleProps", "rightContainerProps", "bottomContainerProps"]
});
