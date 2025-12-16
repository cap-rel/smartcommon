import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Files",
    multiple: true
  },
  code: `
    import { FilesUploader } from "@cap-rel/smartcommon";

    <FilesUploader
      id="files-uploader"
      label="Files"
      multiple={true}
    />
  `
});
