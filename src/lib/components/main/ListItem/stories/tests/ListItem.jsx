import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const ListItem = setTestStory({
    args: {},
    props: propTypes,
    hidden: ["id"]
});
