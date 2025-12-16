import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Color = setTestStory({
    args: {
        value: "#3b82f6",
    },
    props: propTypes,
    hidden: ["id"]
});
