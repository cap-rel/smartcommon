import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Description",
    placeholder: "Enter your description here...",
    rows: 5
  },
  code: `
    import { Textarea } from "@cap-rel/smartcommon";

    <Textarea
      id="description-textarea"
      label="Description"
      placeholder="Enter your description here..."
      rows={5}
    />
  `
});
