import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const LoginComponent = setTestStory({
    args: {
        showEntities: false,
        showSharedDevice: false,
        enableQrPair: false,
    },
    props: propTypes,
    hidden: ["onSuccess", "onError", "labels"],
});
