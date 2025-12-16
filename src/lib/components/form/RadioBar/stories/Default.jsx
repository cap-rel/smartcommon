import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Size",
    options: [
      { value: "s", label: "Small" },
      { value: "m", label: "Medium" },
      { value: "l", label: "Large" }
    ]
  },
  code: `
    import { RadioBar } from "@cap-rel/smartcommon";

    <RadioBar
      id="size-selector"
      label="Size"
      options={[
        { value: "s", label: "Small" },
        { value: "m", label: "Medium" },
        { value: "l", label: "Large" }
      ]}
    />
  `
});
