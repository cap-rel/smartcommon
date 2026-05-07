import { Fab } from "./";

export default {
    title: "Components/Others/Fab",
    component: Fab,
    parameters: {
        docs: { codePanel: true },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        label: { table: { category: "Main" } },
        position: {
            control: { type: "select" },
            options: [
                "bottom-right", "bottom-left", "bottom-center",
                "top-right", "top-left", "top-center",
            ],
            table: { category: "Main" },
        },
        size: {
            control: { type: "radio" },
            options: ["sm", "md", "lg"],
            table: { category: "Main" },
        },
        color: {
            control: { type: "select" },
            options: ["primary", "secondary", "tertiary", "neutral"],
            table: { category: "Main" },
        },
        direction: {
            control: { type: "radio" },
            options: ["up", "down", "left", "right"],
            table: { category: "Main" },
        },
        zIndex: { control: "number", table: { category: "Main" } },
        actions: { table: { category: "Main" } },
        onClick: { action: "clicked", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def, SpeedDial as Sd } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const SpeedDial = { tags: ["!dev"], ...Sd };

export { Fab } from "./stories";
