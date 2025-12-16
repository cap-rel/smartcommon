import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Duration"
  },
  code: `
    import { Timer } from "@cap-rel/smartcommon";

    <Timer
      id="timer"
      label="Duration"
    />
  `
});
