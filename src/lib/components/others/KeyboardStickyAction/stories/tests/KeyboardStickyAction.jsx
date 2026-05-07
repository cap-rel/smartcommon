import { setTestStory } from "../../../../../../storybook";

export const KeyboardStickyAction = setTestStory({
    args: {
        className: "p-2 bg-white border",
        children: "Action button",
    },
    props: { className: null, style: null, children: null },
    hidden: [],
});
