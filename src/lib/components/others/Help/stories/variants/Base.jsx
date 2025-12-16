import { base } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Base = setVariantStory({
  args: {
    variant: "base"
  },
  description: "Description Base in configuration",
  variant: base
});
