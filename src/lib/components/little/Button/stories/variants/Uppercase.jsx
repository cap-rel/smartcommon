import { uppercase } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";
import { FaUser } from "react-icons/fa6";

export const Uppercase = setVariantStory({
  args: {
    label: "Login",
    variant: "uppercase",
    icon: FaUser
  },
  description: "Description Uppercase in configuration",
  variant: uppercase
});