import { DebugWarnings } from "./";

export default {
    title: "Components/Others/DebugWarnings",
    component: DebugWarnings,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "A headless component that intercepts a curated set of " +
                    "React console.error warnings (NaN values, null on " +
                    "controlled inputs, controlled/uncontrolled flips, " +
                    "missing keys, infinite update loops, ...) and prints a " +
                    "structured group with the likely culprit (owner " +
                    "component, source location, suspect DOM nodes). It also " +
                    "triggers `debugger;` (no-op when DevTools are closed).",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    argTypes: {},
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
