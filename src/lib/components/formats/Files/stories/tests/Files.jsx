import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Files = setTestStory({
    args: {},
    props: propTypes,
    hidden: ["id"]
});
