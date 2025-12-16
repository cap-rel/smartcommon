import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Overlay = setTestStory({
    args: {
        isOpen: true,
    },
    props: propTypes,
    hidden: ["id", "close", "onClick", "overlayProps"]
});
