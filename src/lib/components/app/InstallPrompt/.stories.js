import { InstallPrompt } from "./";

export default {
    title: "Components/App/InstallPrompt",
    component: InstallPrompt,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Invites the user to install the PWA on their device: the " +
                    "browser's own install dialog when it offers one (Chrome, " +
                    "Edge, Android), otherwise step-by-step instructions for the " +
                    "detected browser (Safari on iOS, Firefox...). Shown once " +
                    "`minVisits` visits are reached, and offered again " +
                    "`remindAfterDays` after a refusal. `openInstallPrompt()` " +
                    "opens it on demand, for a menu entry. With `report`, the " +
                    "install state is sent to smartAuth.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    argTypes: {
        variant: { control: "inline-radio", options: ["banner", "modal"], table: { category: "Main" } },
        position: { control: "inline-radio", options: ["top", "bottom"], table: { category: "Main" } },
        remindAfterDays: { control: "number", table: { category: "Behavior" } },
        minVisits: { control: "number", table: { category: "Behavior" } },
        report: { control: "boolean", table: { category: "Behavior" } },
        labels: { control: "object", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def, Modal as Mo } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Modal = { tags: ["!dev"], ...Mo };
