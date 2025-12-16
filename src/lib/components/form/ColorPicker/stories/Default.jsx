import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Color",
    defaultValue: "#3b82f6"
  },
  code: `
    import { ColorPicker } from "@cap-rel/smartcommon";

    <ColorPicker
      id="color-picker"
      label="Color"
      defaultValue="#3b82f6"
    />
  `
});
