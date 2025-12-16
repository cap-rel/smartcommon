import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const LazyLink = setTestStory({
    args: {
        to: "/about",
        children: "Go to About"
    },
    props: propTypes,
    hidden: ["onClick", "lazyLinkProps"]
});
