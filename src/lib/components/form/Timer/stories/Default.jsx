import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Duration",
    showSeconds: false
  },
  code: `
    import { Timer } from "@cap-rel/smartcommon";

    <Timer
      id="timer"
      label="Duration"
      showSeconds={false}
    />
  `
});
