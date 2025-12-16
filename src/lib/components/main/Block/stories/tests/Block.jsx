import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Block = setTestStory({
    args: {
        title: "Test Block",
        children: "Test block content",
    },
    props: propTypes,
    hidden: ["id", "children", "containerProps", "titleProps", "headerProps", "blockProps", "footerProps"]
});
