import { Icon } from "./";

export default {
    title: "Components/Form/Tools/Icon",
    component: Icon,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Low-level toggleable icon used by the Checker form " +
                    "primitive (e.g. a favourite star). Colored with the " +
                    "theme primary when checked. It receives its mergeProps " +
                    "from the parent variant merger; this story passes a " +
                    "passthrough that applies the slot's own default classes.",
            },
        },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        checked: { control: "boolean", table: { category: "Main" } },
        disabled: { control: "boolean", table: { category: "Appearance" } },
        icon: { control: false, table: { category: "Main" } },
        onClick: { control: false, table: { category: "Events" } },
        mergeProps: { control: false, table: { disable: true } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
