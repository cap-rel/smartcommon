import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Tags"
  },
  code: `
    import { Array } from "@cap-rel/smartcommon";

    <Array
      label="Tags"
    />
  `
});
