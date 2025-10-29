import { uppercase } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Uppercase = setVariantStory({
  args: {
    label: "Login",
    variant: "uppercase"
  },
  description: "Description Uppercase in configuration",
  variant: uppercase
});