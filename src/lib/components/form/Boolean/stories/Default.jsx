import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Accept terms",
    type: "switch"
  },
  code: `
    import { Boolean } from "@cap-rel/smartcommon";

    <Boolean
      id="accept-terms"
      label="Accept terms"
      type="switch"
    />
  `
});
