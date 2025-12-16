import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: ["Tag 1", "Tag 2", "Tag 3"]
  },
  code: `
    import { Tags } from "@cap-rel/smartcommon";

    <Tags
      id="tags-example"
      value={["Tag 1", "Tag 2", "Tag 3"]}
    />
  `
});
