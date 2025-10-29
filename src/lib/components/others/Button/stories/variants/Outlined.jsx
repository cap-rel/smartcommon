import { outlined } from "../../variants";

export const Outlined = {
  args: {
    label: "Login"
  },
  parameters: {
    docs: {
      description: {
        story: "Description Outlined in configuration"
      },
      source: {
        code: outlined.toString().replace("() => (", "").slice(0, -1)
      }
    }
  }
};