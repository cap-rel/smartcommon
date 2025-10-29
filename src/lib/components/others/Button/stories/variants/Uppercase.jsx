import { uppercase } from "../../variants";

export const Uppercase = {
  args: {
    label: "Login"
  },
  parameters: {
    docs: {
      description: {
        story: "Description Uppercase in configuration"
      },
      source: {
        code: uppercase.toString().replace("() => (", "").slice(0, -1)
      }
    }
  }
};