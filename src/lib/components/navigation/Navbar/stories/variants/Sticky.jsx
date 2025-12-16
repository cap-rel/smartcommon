import { sticky } from "../../variants";
import { setVariantStory } from "../../../../../../storybook";

export const Sticky = setVariantStory({
  args: {
    id: "navbar",
    title: "Sticky Navbar",
    variant: "sticky"
  },
  description: "Navbar that sticks to the top of the page",
  variant: sticky
});
