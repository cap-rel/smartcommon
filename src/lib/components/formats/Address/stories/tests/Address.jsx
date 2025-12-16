import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Address = setTestStory({
    args: {
        value: "456 Oak Avenue, Seattle, WA 98101"
    },
    props: propTypes,
    hidden: ["id"]
});
