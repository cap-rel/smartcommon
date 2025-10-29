import { uppercase } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Uppercase = setVariantStory({
  args: {
    label: "Login"
  },
  description: "Description Uppercase in configuration",
  variant: uppercase
});