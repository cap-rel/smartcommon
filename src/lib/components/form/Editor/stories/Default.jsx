import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Content"
  },
  code: `
    import { Editor } from "@cap-rel/smartcommon";

    <Editor
      id="content-editor"
      label="Content"
    />
  `
});
