import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Panel = setTestStory({
    args: {
        position: "bottom",
        isOpen: true,
        children: "Panel content"
    },
    props: propTypes,
    hidden: ["id", "children", "close", "overlayProps", "panelProps", "dashProps"]
});
