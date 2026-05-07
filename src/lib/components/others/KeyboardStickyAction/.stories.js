import { KeyboardStickyAction } from "./";

export default {
    title: "Components/Others/KeyboardStickyAction",
    component: KeyboardStickyAction,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Renders an action element in the normal document flow. " +
                    "When the virtual keyboard opens on mobile, a floating " +
                    "copy of the children appears just above the keyboard. " +
                    "The floating behaviour cannot be seen in this story " +
                    "(no virtual keyboard on desktop) - test on a real " +
                    "mobile device.",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    argTypes: {
        className: { table: { category: "Main" } },
        style: { table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { KeyboardStickyAction } from "./stories";
