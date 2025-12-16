import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const SignaturePad = setTestStory({
    args: {
        label: "Signature",
    },
    props: propTypes,
    hidden: ["id", "icon", "prefix", "suffix", "name", "value", "onChange", "defaultValue", "formSubmitted", "onError", "containerProps", "labelContainerProps", "iconProps", "labelProps", "starProps", "childrenContainerProps", "prefixProps", "suffixProps", "footerProps", "helpIconProps", "helpAndErrorsContainerProps", "helpProps", "errorProps", "mainContainerProps", "headerProps", "EraseButton", "titleProps", "ValidateButton", "signatureContainerProps", "Pad", "SignerInput"]
});
