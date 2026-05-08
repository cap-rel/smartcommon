import { useState } from "react";
import { setDefaultStory } from "../../../../../storybook";
import { PhotoAnnotator } from "../index";
import {
    SAMPLE_IMAGE,
    sampleNoteType,
    sampleProductType,
    sampleAlertType,
    samplePhotoType,
} from "../decorators";

const Component = (args) => {
    const [annotations, setAnnotations] = useState([]);
    return (
        <div className="h-[600px] w-full max-w-3xl mx-auto bg-white">
            <PhotoAnnotator
                {...args}
                src={SAMPLE_IMAGE}
                annotationTypes={{
                    note: sampleNoteType,
                    product: sampleProductType,
                    photo: samplePhotoType,
                    alert: sampleAlertType,
                }}
                annotations={annotations}
                onChange={setAnnotations}
                onAnnotationActivate={(a) => {
                    // Demo: in production this would navigate to a sub-photo.
                    if (a.type === "photo") {
                        // eslint-disable-next-line no-alert
                        window.alert(`Drill into ${a.payload?.targetPhotoId}`);
                    }
                }}
            />
        </div>
    );
};

export const MultipleTypes = setDefaultStory({
    args: {},
    code: `
        // Long-press the image (or click +) and the type picker appears.
        // The "photo" type triggers onAnnotationActivate on double-click for
        // sub-photo drill-in.
        <PhotoAnnotator
          src={photo.url}
          annotations={annotations}
          onChange={setAnnotations}
          annotationTypes={{
            note: noteType,
            product: {
              ...productType,
              renderEditor: (a, { onSave, onCancel }) => (
                <ProductCategoryBrowser
                  open
                  mode="quantity-discount"
                  onSelect={(payload) => onSave({ payload })}
                  onClose={onCancel}
                />
              ),
            },
            photo: photoType,
            alert: alertType,
          }}
          onAnnotationActivate={(a) => {
            if (a.type === "photo") navigate(\`/photos/\${a.payload.targetPhotoId}\`);
          }}
        />
    `,
});

MultipleTypes.render = Component;
