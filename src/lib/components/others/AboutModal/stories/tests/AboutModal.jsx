import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const AboutModal = setTestStory({
    args: {
        open: true,
        appName: "TestApp",
        version: "0.0.1",
    },
    props: propTypes,
    hidden: ["onClose"],
});
