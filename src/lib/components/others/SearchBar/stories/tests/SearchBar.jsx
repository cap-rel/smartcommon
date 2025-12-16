import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const SearchBar = setTestStory({
    args: {},
    props: propTypes,
    hidden: ["id"]
});
