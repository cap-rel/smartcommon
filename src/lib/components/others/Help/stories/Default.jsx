import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Help } from "@cap-rel/smartcommon";

    <Help />
  `
});
