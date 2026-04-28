import { setDefaultStory } from "../../../../../storybook";

/**
 * Upload mode story. Each photo is POSTed to the smartauth /upload
 * route and the returned upload_id is stored in value.uploadId. The
 * business module then references uploadId from its own JSON payload.
 *
 * This story renders correctly in Storybook but the actual upload only
 * succeeds when the page is wrapped in a real ApiProvider pointing at a
 * working smartauth backend.
 */
export const Upload = setDefaultStory({
  args: {
    label: "Photos (upload binaire)",
    multiple: true,
    defaultValue: [],
    outputFormat: "upload",
  },
  code: `
    import { PhotosUploader } from "@cap-rel/smartcommon";

    <PhotosUploader
      id="photos-uploader-upload"
      label="Photos"
      multiple={true}
      outputFormat="upload"
      onChange={photos => {
        // photos: [{ uploadId, previewUrl, mimeType, filename, ... }, ...]
        // Reference uploadId from your own form payload.
      }}
    />
  `
});
