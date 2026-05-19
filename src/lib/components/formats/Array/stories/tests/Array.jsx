import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

// Storybook test story for formats/Array. The export name `Array`
// here is local to this story file and does not collide with the
// global because no `Array(...)` call is made in the body.
export const Array = setTestStory({
    args: {
        value: [{ fullname: "Jean Dupont" }, { fullname: "Alice Martin" }],
    },
    props: propTypes,
    hidden: []
});
