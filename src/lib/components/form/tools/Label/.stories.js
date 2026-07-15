import { Label } from "./";

export default {
    title: "Components/Form/Tools/Label",
    component: Label,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Dumb label slot used by the form primitives (Input, " +
                    "Checker, Rater, ...). Renders the label, an optional " +
                    "required star, wraps its children, and shows help text " +
                    "or validation errors in a footer. Standalone it applies " +
                    "each slot's default classes via a built-in passthrough.",
            },
        },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        label: { control: "text", table: { category: "Main" } },
        help: { control: "text", table: { category: "Main" } },
        required: { control: "boolean", table: { category: "Appearance" } },
        showErrors: { control: "boolean", table: { category: "Appearance" } },
        id: { control: "text", table: { category: "Main" } },
        icon: { control: false, table: { category: "Appearance" } },
        prefix: { control: false, table: { category: "Appearance" } },
        suffix: { control: false, table: { category: "Appearance" } },
        errors: { control: "object", table: { category: "Main" } },
        children: { control: false, table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
