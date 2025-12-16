import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const List = setTestStory({
    args: {
        id: "test-list",
        title: "Test List",
    },
    props: propTypes,
    hidden: ["id", "children", "containerProps", "titleProps", "controlsContainer", "SearchInput", "SortButton", "paginationContainerProps"]
});
