import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "+33612345678"
  },
  code: `
    import { PhoneNumber } from "@cap-rel/smartcommon";

    <PhoneNumber
      id="phone-number"
      value="+33612345678"
    />
  `
});
