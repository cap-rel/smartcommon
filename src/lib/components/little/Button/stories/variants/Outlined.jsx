import { outlined } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";
import { FaUser } from "react-icons/fa6";

export const Outlined = setVariantStory({
  args: {
    label: "Login",
    variant: "outlined",
    icon: FaUser
  },
  description: "Description Outlined in configuration",
  variant: outlined
});