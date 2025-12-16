import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Signature"
  },
  code: `
    import { SignaturePad } from "@cap-rel/smartcommon";

    <SignaturePad
      id="signature-pad"
      label="Signature"
    />
  `
});
