import { shadow } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Shadow = setVariantStory({
  args: {
    id: "navbar",
    title: "Shadow Navbar",
    variant: "shadow"
  },
  description: "Navbar with shadow effect",
  variant: shadow
});
