import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Url = setTestStory({
    args: {
        value: "https://www.google.com",
    },
    props: propTypes,
    hidden: ["id"]
});
