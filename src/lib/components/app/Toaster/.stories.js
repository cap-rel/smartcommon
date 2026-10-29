import { Toaster } from "./";

export default {
    title: "Components/App/Toaster",
    component: Toaster,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Renders the notifications emitted with `toast()` from " +
                    "`react-hot-toast` (`toast.success`, `toast.error`, " +
                    "`toast.promise`...), at the top center of the screen. " +
                    "`<Provider>` mounts it once, next to the router so a page " +
                    "change never removes a toast: do not mount another one. " +
                    "It takes no props.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
