import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Photos",
    multiple: true,
    defaultValue: []
  },
  code: `
    import { PhotosUploader } from "@cap-rel/smartcommon";

    <PhotosUploader
      id="photos-uploader"
      label="Photos"
      multiple={true}
    />
  `
});
