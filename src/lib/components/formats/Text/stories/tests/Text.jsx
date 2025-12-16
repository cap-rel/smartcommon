import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Text = setTestStory({
    args: {
        value: "Lorem ipsum dolor sit amet"
    },
    props: propTypes,
    hidden: []
});
