import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Popup = setTestStory({
    args: {
        title: "Test Popup",
        isOpen: true,
        children: "This is a test popup content"
    },
    props: propTypes,
    hidden: ["id", "children", "close", "Overlay", "popupBackdrop", "popupProps", "titleAndButtonContainerProps", "titleProps", "Button"]
});
