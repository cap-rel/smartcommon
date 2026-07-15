import { Checkbox } from "./";

export default {
    title: "Components/Form/Tools/Checkbox",
    component: Checkbox,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Low-level checkbox glyph used by the Boolean / Checker " +
                    "form primitives. It receives its mergeProps from the " +
                    "parent variant merger; this story passes a passthrough " +
                    "that applies the slot's own default classes.",
            },
        },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        checked: { control: "boolean", table: { category: "Main" } },
        disabled: { control: "boolean", table: { category: "Appearance" } },
        onClick: { control: false, table: { category: "Events" } },
        mergeProps: { control: false, table: { disable: true } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
