import { FaHouse, FaGear, FaUser } from "react-icons/fa6";
import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";
import { TabbarItem } from "../../../TabbarItem";

export const Tabbar = setTestStory({
    args: {
        children: (
            <>
                <TabbarItem id="home" icon={FaHouse} label="Home" active />
                <TabbarItem id="settings" icon={FaGear} label="Settings" />
                <TabbarItem id="profile" icon={FaUser} label="Profile" />
            </>
        )
    },
    props: propTypes,
    hidden: ["id", "children", "centralButton", "tabbarProps"]
});
