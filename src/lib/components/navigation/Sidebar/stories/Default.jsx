import { FaHouse, FaGear } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    links: [
      { label: "Home", icon: FaHouse },
      { label: "Settings", icon: FaGear }
    ]
  },
  code: `
    import { Sidebar } from "@cap-rel/smartcommon";
    import { FaHouse, FaGear } from "react-icons/fa6";

    <Sidebar
      id="main-sidebar"
      links={[
        { label: "Home", icon: FaHouse },
        { label: "Settings", icon: FaGear }
      ]}
    />
  `
});
