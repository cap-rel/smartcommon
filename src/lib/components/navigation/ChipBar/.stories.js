import { ChipBar } from "./";

export default {
    title: "Components/Navigation/ChipBar",
    component: ChipBar,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Reusable chip bar. Each chip is filled when active, " +
                    "outlined when not; chips wrap to a second line rather " +
                    "than scrolling horizontally. A chip with variant: " +
                    "'status' renders as a squared sub-filter with optional " +
                    "icon and caller-supplied colors.",
            },
        },
        layout: "centered",
    },
    tags: ["Navigation"],
    argTypes: {
        chips: {
            control: "object",
            table: { category: "Main" },
        },
        variant: {
            control: false,
            table: { category: "Main" },
        },
        containerProps: {
            table: { category: "Elements" },
        },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
