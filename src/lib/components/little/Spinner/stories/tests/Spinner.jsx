import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Spinner = setTestStory({
    args: {
        size: 4,
    },
    props: propTypes,
    hidden: ["id", "spinnerProps"]
});
