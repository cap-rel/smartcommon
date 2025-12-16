import { FaUser } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Profile",
    icon: <FaUser />
  },
  code: `
    import { UpperNavbarItem } from "@cap-rel/smartcommon";
    import { FaUser } from "react-icons/fa6";

    <UpperNavbarItem
      id="profile-item"
      label="Profile"
      icon={<FaUser />}
    />
  `
});
