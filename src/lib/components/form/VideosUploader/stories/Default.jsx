import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    label: "Videos",
    multiple: true
  },
  code: `
    import { VideosUploader } from "@cap-rel/smartcommon";

    <VideosUploader
      id="videos-uploader"
      label="Videos"
      multiple={true}
    />
  `
});
