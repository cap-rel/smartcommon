import { FaUser } from "react-icons/fa6";

export const Default = {
  args: {
    label: "Login",
    icon: FaUser
  },
  parameters: {
    docs: {
      source: {
        code: `
          import { Button } from "@cap-rel/smartcommon";
          import { FaUser } from "react-icons/fa6";

          <Button
            id="login-button"
            label="Login"
            icon={FaUser}
          />
        `
      }
    }
  }
};
