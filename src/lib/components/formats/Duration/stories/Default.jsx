import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: 3661
  },
  code: `
    import { Duration } from "@cap-rel/smartcommon";

    <Duration
      value={3661}
    />
  `
});
