import { Calculator } from "./";

export default {
    title: "Components/Others/Calculator",
    component: Calculator,
    parameters: {
        docs: { codePanel: true },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        title: { table: { category: "Main" } },
        position: {
            control: { type: "select" },
            options: [
                "bottom-right", "bottom-left", "bottom-center",
                "center", "top-right", "top-left",
            ],
            table: { category: "Main" },
        },
        showFab: { control: "boolean", table: { category: "Main" } },
        showOverlay: { control: "boolean", table: { category: "Main" } },
        showHistory: { control: "boolean", table: { category: "Main" } },
        showMemory: { control: "boolean", table: { category: "Main" } },
        closeOnResult: { control: "boolean", table: { category: "Main" } },
        zIndex: { control: "number", table: { category: "Main" } },
        onResult: { action: "result", table: { category: "Events" } },
        onClose: { action: "closed", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def, Compact as Cmp } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Compact = { tags: ["!dev"], ...Cmp };

export { Calculator } from "./stories";
