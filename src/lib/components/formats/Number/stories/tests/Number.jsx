import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Number = setTestStory({
    args: {
        value: 42,
    },
    props: propTypes,
    hidden: []
});
