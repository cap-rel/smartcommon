import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Gps = setTestStory({
    args: {
        label: "Location",
    },
    props: propTypes,
    hidden: ["onLocate", "containerProps", "labelContainerProps", "labelProps", "starProps", "helpProps", "buttonContainerProps", "LocateButton", "locationProps"]
});
