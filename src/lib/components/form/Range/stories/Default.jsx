import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Volume",
    rangeMin: 0,
    rangeMax: 100
  },
  code: `
    import { Range } from "@cap-rel/smartcommon";

    <Range
      id="volume-range"
      label="Volume"
      rangeMin={0}
      rangeMax={100}
    />
  `
});
