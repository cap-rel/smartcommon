import { reverse } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";
import { FaUser } from "react-icons/fa6";

export const Reverse = setVariantStory({
  args: {
    label: "Login",
    variant: "reverse",
    icon: FaUser
  },
  description: "Description Reverse in configuration",
  variant: reverse
});