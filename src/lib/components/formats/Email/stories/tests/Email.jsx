import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Email = setTestStory({
    args: {
        value: "user@example.com",
    },
    props: propTypes,
    hidden: ["linkProps", "iconProps", "emailProps"]
});
