import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Map } from "@cap-rel/smartcommon";

    <Map />
  `
});
