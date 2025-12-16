import { FaHouse } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    icon: FaHouse,
    label: "Home",
    active: true
  },
  code: `
    import { TabbarItem } from "@cap-rel/smartcommon";
    import { FaHouse } from "react-icons/fa6";

    <TabbarItem
      id="home"
      icon={FaHouse}
      label="Home"
      active
    />
  `
});
