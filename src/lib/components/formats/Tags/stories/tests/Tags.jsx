import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Tags = setTestStory({
    args: {
        value: ["Tag 1", "Tag 2", "Tag 3"]
    },
    props: propTypes,
    hidden: ["id"]
});
