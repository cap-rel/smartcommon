import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const BarcodeScanner = setTestStory({
    args: {
        open: true,
        continuous: false,
        debounceMs: 1500,
    },
    props: propTypes,
    hidden: ["onScan", "onClose", "feedbackContent"],
});
