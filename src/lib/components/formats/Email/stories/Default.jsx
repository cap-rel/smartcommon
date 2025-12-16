import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "user@example.com"
  },
  code: `
    import { Email } from "@cap-rel/smartcommon";

    <Email
      value="user@example.com"
    />
  `
});
