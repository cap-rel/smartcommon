import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const String = setTestStory({
    args: {
        value: "Hello World",
    },
    props: propTypes,
    hidden: []
});
