import { ConfirmProvider } from "./";

export default {
    title: "Components/App/ConfirmProvider",
    component: ConfirmProvider,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Promise-based confirmation and alert dialogs, through the " +
                    "`useConfirm()` hook: `await confirm({ title, message, type, " +
                    "confirmText, cancelText })` resolves `true` or `false`, " +
                    "`await alert({ ... })` resolves once closed. `type` sets " +
                    "the icon and the button color (`danger`, `delete`, " +
                    "`warning`, `info`). Not mounted by `<Provider>`: wrap the " +
                    "app with it yourself, under `<Provider>`.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    argTypes: {
        children: { control: false, table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
