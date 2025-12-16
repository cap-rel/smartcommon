import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Datetime } from "@cap-rel/smartcommon";

    <Datetime
      id="datetime-example"
    />
  `
});
