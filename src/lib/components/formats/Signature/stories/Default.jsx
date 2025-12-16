import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
  },
  code: `
    import { Signature } from "@cap-rel/smartcommon";

    <Signature
      id="signature"
    />
  `
});
