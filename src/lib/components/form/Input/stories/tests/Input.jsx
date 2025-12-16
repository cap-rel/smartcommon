import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Input = setTestStory({
    args: {
        label: "Username",
        placeholder: "Enter your username",
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "inputIcon", "pattern", "onChange", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "inputContainerProps", "Spinner", "inputIconProps", "inputProps", "MinusButton", "PlusButton", "PasswordButton"]
});
