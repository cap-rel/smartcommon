import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: 42
  },
  code: `
    import { Number } from "@cap-rel/smartcommon";

    <Number value={42} />
  `
});
