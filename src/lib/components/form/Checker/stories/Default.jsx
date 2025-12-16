import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Features",
    options: [
      { value: "wifi", label: "WiFi" },
      { value: "parking", label: "Parking" }
    ],
    type: "checkbox"
  },
  code: `
    import { Checker } from "@cap-rel/smartcommon";

    <Checker
      id="features-checker"
      label="Features"
      options={[
        { value: "wifi", label: "WiFi" },
        { value: "parking", label: "Parking" }
      ]}
      type="checkbox"
    />
  `
});
