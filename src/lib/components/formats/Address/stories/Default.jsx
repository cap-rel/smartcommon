import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "123 Main Street, Springfield, IL 62701"
  },
  code: `
    import { Address } from "@cap-rel/smartcommon";

    <Address
      id="address-display"
      value="123 Main Street, Springfield, IL 62701"
    />
  `
});
