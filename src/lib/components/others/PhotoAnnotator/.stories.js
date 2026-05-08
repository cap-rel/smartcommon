import { PhotoAnnotator } from "./";

export default {
    title: "Components/Others/PhotoAnnotator",
    component: PhotoAnnotator,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Place markers on a photo with type-specific editors. " +
                    "Controlled API: pass `annotations` + `onChange`, no " +
                    "internal storage. Each type in `annotationTypes` " +
                    "provides its own marker / editor / list item " +
                    "renderers, so consumers wire their own business " +
                    "(notes, products via <ProductCategoryBrowser>, sub-" +
                    "photos via onAnnotationActivate, etc). Long-press the " +
                    "image to add at that position, click '+ Ajouter' to " +
                    "add at the center, long-press a marker to drag it.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        readOnly: { control: "boolean", table: { category: "Main" } },
        listPosition: {
            control: { type: "select" },
            options: ["bottom", "right", "off"],
            table: { category: "Main" },
        },
        showAddButton: { control: "boolean", table: { category: "Main" } },
        showZoomReset: { control: "boolean", table: { category: "Main" } },
        longPressMs: { control: "number", table: { category: "Main" } },
        minZoom: { control: "number", table: { category: "Main" } },
        maxZoom: { control: "number", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        annotations: { table: { disable: true } },
        annotationTypes: { table: { disable: true } },
        src: { table: { disable: true } },
        onChange: { action: "change", table: { category: "Events" } },
        onAnnotationSelect: { action: "select", table: { category: "Events" } },
        onAnnotationActivate: { action: "activate", table: { category: "Events" } },
    },
    args: {},
};

import {
    Default as Def,
    MultipleTypes as Mt,
    ReadOnly as Ro,
    RightSidebar as Rs,
} from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const MultipleTypes = { tags: ["!dev"], ...Mt };
export const ReadOnly = { tags: ["!dev"], ...Ro };
export const RightSidebar = { tags: ["!dev"], ...Rs };

export { PhotoAnnotator } from "./";
