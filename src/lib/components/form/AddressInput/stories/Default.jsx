import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Address"
  },
  code: `
    import { AddressInput } from "@cap-rel/smartcommon";

    <AddressInput
      id="address-input"
      label="Address"
    />
  `
});
