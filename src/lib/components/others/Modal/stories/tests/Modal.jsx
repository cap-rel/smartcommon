import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Modal = setTestStory({
    args: {
        isOpen: true,
        title: "Test modal",
        size: "md",
        position: "center",
        children: "Test content",
    },
    props: propTypes,
    hidden: ["onClose"],
});
