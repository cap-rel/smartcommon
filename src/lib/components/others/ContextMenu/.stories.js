import { ContextMenu } from "./";

export default {
    title: "Components/Others/ContextMenu",
    component: ContextMenu,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Desktop right-click menu, fixed at the pointer and kept " +
                    "inside the window. Its state comes from the " +
                    "useContextMenu() hook: each target calls ctx.open(event, " +
                    "items), and a single <ContextMenu state={ctx} /> is " +
                    "rendered once in the page. Same menu and keyboard as " +
                    "Dropdown.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        state: { control: false, table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        testId: { control: "text", table: { category: "Main" } },
        zIndex: { control: "number", table: { category: "Appearance" } },
        menuProps: { control: false, table: { category: "Elements" } },
        itemProps: { control: false, table: { category: "Elements" } },
        dividerProps: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, WithKebab as Wk } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const WithKebab = { tags: ["!dev"], ...Wk };
