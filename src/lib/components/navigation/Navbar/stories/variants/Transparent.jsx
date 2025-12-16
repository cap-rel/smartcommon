import { transparent } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Transparent = setVariantStory({
  args: {
    id: "navbar",
    title: "Transparent Navbar",
    variant: "transparent"
  },
  description: "Navbar with transparent background",
  variant: transparent
});
