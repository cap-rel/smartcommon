import { useState } from "react";
import { setDefaultStory } from "../../../../../storybook";
import { PhotoAnnotator } from "../index";
import {
    SAMPLE_IMAGE,
    sampleNoteType,
    sampleProductType,
} from "../decorators";

const Component = (args) => {
    const [annotations, setAnnotations] = useState([]);
    return (
        <div className="h-[600px] w-full max-w-5xl mx-auto bg-white">
            <PhotoAnnotator
                {...args}
                src={SAMPLE_IMAGE}
                annotationTypes={{
                    note: sampleNoteType,
                    product: sampleProductType,
                }}
                annotations={annotations}
                onChange={setAnnotations}
            />
        </div>
    );
};

export const RightSidebar = setDefaultStory({
    args: { listPosition: "right" },
    code: `
        // listPosition="right" puts the list as a sidebar (desktop-first).
        // On narrow viewports it still falls back to a usable layout.
        <PhotoAnnotator
          listPosition="right"
          src={photo.url}
          ...
        />
    `,
});

RightSidebar.render = Component;
