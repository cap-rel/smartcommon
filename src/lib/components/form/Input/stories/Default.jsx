import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email"
  },
  code: `
    import { Input } from "@cap-rel/smartcommon";

    <Input
      id="email-input"
      label="Email"
      placeholder="Enter your email"
      type="email"
    />
  `
});
