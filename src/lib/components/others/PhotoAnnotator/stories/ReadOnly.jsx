import { useState } from "react";
import { setDefaultStory } from "../../../../../storybook";
import { PhotoAnnotator } from "../index";
import {
    SAMPLE_IMAGE,
    sampleNoteType,
    sampleProductType,
    sampleAlertType,
} from "../decorators";

const SEED = [
    {
        id: "n1",
        type: "note",
        x: 25,
        y: 60,
        payload: { description: "Fissure visible sur le mur", color: "#F59E0B" },
    },
    {
        id: "p1",
        type: "product",
        x: 70,
        y: 70,
        payload: { product_label: "Volet roulant", qty: 4 },
    },
    {
        id: "a1",
        type: "alert",
        x: 50,
        y: 30,
        payload: { description: "Élément manquant" },
    },
];

const Component = (args) => {
    const [annotations, setAnnotations] = useState(SEED);
    return (
        <div className="h-[600px] w-full max-w-3xl mx-auto bg-white">
            <PhotoAnnotator
                {...args}
                src={SAMPLE_IMAGE}
                annotationTypes={{
                    note: sampleNoteType,
                    product: sampleProductType,
                    alert: sampleAlertType,
                }}
                annotations={annotations}
                onChange={setAnnotations}
            />
        </div>
    );
};

export const ReadOnly = setDefaultStory({
    args: { readOnly: true, showAddButton: false },
    code: `
        // readOnly disables: add, edit, delete, drag.
        // Marker click + double-click still fire onAnnotationSelect /
        // onAnnotationActivate so the consumer can still react.
        <PhotoAnnotator
          src={photo.url}
          annotations={savedAnnotations}
          onChange={() => {}}
          annotationTypes={types}
          readOnly
          showAddButton={false}
          onAnnotationSelect={(a) => highlight(a.id)}
          onAnnotationActivate={(a) => navigate(\`/photos/\${a.payload.targetPhotoId}\`)}
        />
    `,
});

ReadOnly.render = Component;
