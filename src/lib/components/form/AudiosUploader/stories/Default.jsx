import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Audio files",
    multiple: true
  },
  code: `
    import { AudiosUploader } from "@cap-rel/smartcommon";

    <AudiosUploader
      label="Audio files"
      multiple={true}
    />
  `
});
