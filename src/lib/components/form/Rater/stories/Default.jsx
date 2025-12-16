import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Rating",
    ratingMax: 5
  },
  code: `
    import { Rater } from "@cap-rel/smartcommon";

    <Rater
      id="rating-input"
      label="Rating"
      ratingMax={5}
    />
  `
});
