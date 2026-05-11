import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const DevicePicker = setTestStory({
    args: {
        existingDevices: [],
    },
    props: propTypes,
    hidden: ["onPick", "onCreate", "onCancel", "labels"],
});
