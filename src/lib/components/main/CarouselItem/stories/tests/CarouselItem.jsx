import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const CarouselItem = setTestStory({
    args: {},
    props: propTypes,
    hidden: ["id"]
});
