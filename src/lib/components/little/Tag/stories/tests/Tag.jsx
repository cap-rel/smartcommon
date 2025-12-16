import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Tag = setTestStory({
    args: {
        children: "Active",
    },
    props: propTypes,
    hidden: []
});
