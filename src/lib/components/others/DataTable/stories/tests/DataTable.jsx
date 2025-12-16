import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const DataTable = setTestStory({
    args: {},
    props: propTypes,
    hidden: ["id"]
});
