import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Stepper = setTestStory({
    args: {
        title: "Registration",
        header: "Please complete all fields",
        children: "Form content"
    },
    props: propTypes,
    hidden: ["steps", "containerProps", "titleProps", "headerProps", "blockProps", "footerProps"]
});
