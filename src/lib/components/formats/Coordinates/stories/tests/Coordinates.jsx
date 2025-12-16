import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Coordinates = setTestStory({
    args: {
        value: [48.8566, 2.3522]
    },
    props: propTypes,
    hidden: ["id", "linkProps", "iconProps", "coordinatesProps"]
});
