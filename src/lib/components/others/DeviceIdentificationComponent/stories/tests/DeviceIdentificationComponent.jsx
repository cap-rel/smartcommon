import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const DeviceIdentificationComponent = setTestStory({
    args: {
        noDeviceValue: "noDevice",
    },
    props: propTypes,
    hidden: ["onSuccess", "onError", "labels", "icon", "getErrorLabel"],
});
