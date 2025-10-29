import { rounded } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";
import { FaUser } from "react-icons/fa6";

export const Rounded = setVariantStory({
  args: {
    variant: "rounded",
    icon: FaUser
  },
  description: "Description Rounded in configuration",
  variant: rounded
});