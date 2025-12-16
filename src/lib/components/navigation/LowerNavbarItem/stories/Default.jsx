import { FaHouse } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    icon: FaHouse,
    label: "Home",
    active: true
  },
  code: `
    import { LowerNavbarItem } from "@cap-rel/smartcommon";
    import { FaHouse } from "react-icons/fa6";

    <LowerNavbarItem
      id="home-item"
      icon={FaHouse}
      label="Home"
      active={true}
    />
  `
});
