import { FaUser } from "react-icons/fa6";
import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Login",
    icon: FaUser
  },
  code: `
    import { Button } from "@cap-rel/smartcommon";
    import { FaUser } from "react-icons/fa6";

    <Button
      id="login-button"
      label="Login"
      icon={FaUser}
    />
  `
});