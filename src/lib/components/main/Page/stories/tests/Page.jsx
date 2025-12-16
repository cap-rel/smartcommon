import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Page = setTestStory({
    args: {
        children: "Page content",
    },
    props: propTypes,
    hidden: ["id", "animations", "pageProps", "contentProps"]
});
