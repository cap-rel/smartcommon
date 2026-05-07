import { DebugConsole } from "./";

export default {
    title: "Components/Others/DebugConsole",
    component: DebugConsole,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "An in-page console that captures log() / createLogger() " +
                    "output. Useful when DevTools are not accessible (mobile, " +
                    "PWA in standalone). Shows a FAB to toggle the panel, " +
                    "supports filtering by level and namespace, and can be " +
                    "detached into a separate window.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        defaultOpen: { control: "boolean", table: { category: "Main" } },
        position: {
            control: { type: "radio" },
            options: ["bottom", "top", "left", "right"],
            table: { category: "Main" },
        },
        height: { control: "text", table: { category: "Main" } },
        maxLogs: { control: "number", table: { category: "Main" } },
        showFab: { control: "boolean", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { DebugConsole } from "./stories";
