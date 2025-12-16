import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    title: "Step 1",
    header: "Complete your profile",
    footer: "This is required to continue",
    children: "Content goes here"
  },
  code: `
    import { Stepper } from "@cap-rel/smartcommon";

    <Stepper
      title="Step 1"
      header="Complete your profile"
      footer="This is required to continue"
    >
      Content goes here
    </Stepper>
  `
});
