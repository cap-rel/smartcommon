import { PhotoEditor } from "./";

export default {
    title: "Components/Others/PhotoEditor",
    component: PhotoEditor,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Fullscreen photo editor for field-capture apps. v1 " +
                    "geometry toolset: crop with aspect ratios, 90-degree " +
                    "rotation, horizontal/vertical mirror and free-angle " +
                    "straightening. Edits are non-destructive (an ordered " +
                    "list of operations) and baked to a Blob on save; the " +
                    "same recipe is handed back through `onSave(blob, " +
                    "{ operations })` so it can be persisted and re-applied. " +
                    "Built on the framework-agnostic `lib/imageEditor` engine.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        open: { control: "boolean", table: { category: "Main" } },
        src: { control: "text", table: { category: "Main" } },
        tools: { control: "object", table: { category: "Main" } },
        maxStraightenAngle: { control: "number", table: { category: "Main" } },
        previewMaxDimension: { control: "number", table: { category: "Main" } },
        output: { control: "object", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        aspectRatios: { table: { disable: true } },
        onSave: { action: "saved", table: { category: "Events" } },
        onCancel: { action: "cancelled", table: { category: "Events" } },
        onError: { action: "error", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { PhotoEditor } from "./";
