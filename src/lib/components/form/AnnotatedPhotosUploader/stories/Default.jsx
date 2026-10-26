import { useState } from "react";
import { setDefaultStory } from "../../../../../storybook";
import { AnnotatedPhotosUploader } from "../index";
import { SAMPLE_IMAGE, sampleNoteType } from "../../../others/PhotoAnnotator/decorators";

// One photo already in the field (as a server would send it back) so the
// annotate button can be tried without a camera.
const Component = (args) => {
    const [photos, setPhotos] = useState([
        { uid: "sample-1", src: SAMPLE_IMAGE, title: "sample", annotations: [] },
    ]);
    return (
        <div className="w-full max-w-xl mx-auto">
            <AnnotatedPhotosUploader
                {...args}
                annotationTypes={{ note: sampleNoteType }}
                value={photos}
                onChange={setPhotos}
            />
        </div>
    );
};

export const Default = setDefaultStory({
    args: {
        label: "Photos",
        max: 5,
    },
    code: `
        import { useState } from "react";
        import { AnnotatedPhotosUploader, locales } from "@cap-rel/smartcommon";

        const [photos, setPhotos] = useState([]);

        <AnnotatedPhotosUploader
          label="Photos"
          max={15}
          outputFormat="upload"
          queue
          annotationTypes={{ note: noteType }}
          value={photos}
          onChange={setPhotos}
          labels={locales.fr.AnnotatedPhotosUploader}
          PhotosUploader={{ labels: locales.fr.PhotosUploader }}
          PhotoAnnotator={{ labels: locales.fr.PhotoAnnotator }}
        />
        // photos: [{ uid, uploadId, previewUrl, title, annotations: [...] }, ...]
    `,
});

Default.render = Component;
