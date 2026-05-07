import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Fab = setTestStory({
    args: {
        label: "Action",
        position: "bottom-right",
        size: "md",
        color: "primary",
    },
    props: propTypes,
    hidden: ["actions", "isOpen", "onOpenChange"],
});
