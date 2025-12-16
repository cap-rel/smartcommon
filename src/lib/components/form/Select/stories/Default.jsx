import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Country",
    options: [
      { value: "fr", label: "France" },
      { value: "us", label: "United States" }
    ]
  },
  code: `
    import { Select } from "@cap-rel/smartcommon";

    <Select
      id="country-select"
      label="Country"
      options={[
        { value: "fr", label: "France" },
        { value: "us", label: "United States" }
      ]}
    />
  `
});
