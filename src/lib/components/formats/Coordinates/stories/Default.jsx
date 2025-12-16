import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: [48.8566, 2.3522]
  },
  code: `
    import { Coordinates } from "@cap-rel/smartcommon";

    <Coordinates
      id="location-coordinates"
      value={[48.8566, 2.3522]}
    />
  `
});
