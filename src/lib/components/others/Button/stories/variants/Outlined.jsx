import { outlined } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Outlined = setVariantStory({
  args: {
    label: "Login"
  },
  description: "Description Outlined in configuration",
  variant: outlined
});