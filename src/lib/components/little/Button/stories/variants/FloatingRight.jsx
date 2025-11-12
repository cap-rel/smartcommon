import { outlined } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";
import { FaUser } from "react-icons/fa6";

export const FloatingRight = setVariantStory({
  args: {
    label: "Login",
    variant: "floatingRight",
    icon: FaUser
  },
  description: "Description Outlined in configuration",
  variant: outlined,
});