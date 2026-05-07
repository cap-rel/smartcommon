import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Calculator = setTestStory({
    args: {
        title: "Calculator",
        position: "center",
        showFab: false,
        showOverlay: false,
        isOpen: true,
    },
    props: propTypes,
    hidden: ["onOpenChange", "fabIcon"],
});
