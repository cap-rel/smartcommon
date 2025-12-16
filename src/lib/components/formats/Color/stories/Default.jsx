import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "#3b82f6"
  },
  code: `
    import { Color } from "@cap-rel/smartcommon";

    <Color
      id="color-display"
      value="#3b82f6"
    />
  `
});
