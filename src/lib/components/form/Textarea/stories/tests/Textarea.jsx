import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Textarea = setTestStory({
    args: {
        label: "Message",
        placeholder: "Type your message...",
    },
    props: propTypes,
    hidden: [
        "id", "icon", "prefix", "suffix", "pattern", "value", "defaultValue", "onChange", "onError",
        "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps",
        "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps",
        "helpAndErrorsContainerProps", "helpProps", "errorProps", "textareaProps"
    ]
});
