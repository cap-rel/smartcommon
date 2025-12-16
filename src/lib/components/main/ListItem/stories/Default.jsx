import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { ListItem } from "@cap-rel/smartcommon";

    <ListItem id="list-item" />
  `
});
