import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const PhoneNumber = setTestStory({
    args: {
        value: "+33612345678",
    },
    props: propTypes,
    hidden: ["id"]
});
