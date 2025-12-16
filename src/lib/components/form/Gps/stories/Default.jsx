import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Location"
  },
  code: `
    import { Gps } from "@cap-rel/smartcommon";

    <Gps
      id="gps-field"
      label="Location"
    />
  `
});
