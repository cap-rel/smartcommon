import { useState } from "react";
import { setDefaultStory } from "../../../../../storybook";
import { PhotoAnnotator } from "../index";
import { SAMPLE_IMAGE, sampleNoteType } from "../decorators";

const Component = (args) => {
    const [annotations, setAnnotations] = useState([]);
    return (
        <div className="h-[600px] w-full max-w-3xl mx-auto bg-white">
            <PhotoAnnotator
                {...args}
                src={SAMPLE_IMAGE}
                annotationTypes={{ note: sampleNoteType }}
                annotations={annotations}
                onChange={setAnnotations}
            />
        </div>
    );
};

export const Default = setDefaultStory({
    args: {},
    code: `
        import { useState } from "react";
        import { PhotoAnnotator } from "@cap-rel/smartcommon";

        const [annotations, setAnnotations] = useState([]);

        <PhotoAnnotator
          src={photo.url}
          annotations={annotations}
          onChange={setAnnotations}
          annotationTypes={{
            note: {
              label: "Note",
              icon: <FaCommentDots />,
              color: "#F59E0B",
              newPayload: () => ({ description: "" }),
              renderMarker: (a, { num }) => <Circle>{num}</Circle>,
              renderEditor: (a, { onSave, onCancel }) => <NoteEditor ... />,
            },
          }}
        />
    `,
});

Default.render = Component;
