import { FaHouse, FaGear, FaUser, FaBell, FaPlus } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";
import { TabbarItem } from "../../TabbarItem";

export const CentralButton = setDefaultStory({
  args: {
    hideOnScroll: false,
    centralButton: { icon: FaPlus, label: "New report", badge: 3 },
    children: (
      <>
        <TabbarItem id="home" icon={FaHouse} label="Home" active />
        <TabbarItem id="alerts" icon={FaBell} label="Alerts" badge={12} />
        <TabbarItem id="settings" icon={FaGear} label="Settings" />
        <TabbarItem id="profile" icon={FaUser} label="Profile" />
      </>
    )
  },
  code: `
    import { Tabbar, TabbarItem } from "@cap-rel/smartcommon";
    import { FaHouse, FaGear, FaUser, FaBell, FaPlus } from "react-icons/fa6";

    <Tabbar
      id="main-tabbar"
      centralButton={{ icon: FaPlus, label: "New report", badge: 3, onClick: openReport }}
    >
      <TabbarItem id="home" icon={FaHouse} label="Home" active />
      <TabbarItem id="alerts" icon={FaBell} label="Alerts" badge={12} />
      <TabbarItem id="settings" icon={FaGear} label="Settings" />
      <TabbarItem id="profile" icon={FaUser} label="Profile" />
    </Tabbar>
  `
});
