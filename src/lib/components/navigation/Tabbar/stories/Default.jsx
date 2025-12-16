import { FaHouse, FaGear, FaUser } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";
import { TabbarItem } from "../../TabbarItem";

export const Default = setDefaultStory({
  args: {
    children: (
      <>
        <TabbarItem id="home" icon={FaHouse} label="Home" active />
        <TabbarItem id="settings" icon={FaGear} label="Settings" />
        <TabbarItem id="profile" icon={FaUser} label="Profile" />
      </>
    )
  },
  code: `
    import { Tabbar, TabbarItem } from "@cap-rel/smartcommon";
    import { FaHouse, FaGear, FaUser } from "react-icons/fa6";

    <Tabbar id="main-tabbar">
      <TabbarItem id="home" icon={FaHouse} label="Home" active />
      <TabbarItem id="settings" icon={FaGear} label="Settings" />
      <TabbarItem id="profile" icon={FaUser} label="Profile" />
    </Tabbar>
  `
});
