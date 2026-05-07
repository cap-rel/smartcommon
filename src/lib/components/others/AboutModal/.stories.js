import { AboutModal } from "./";

export default {
    title: "Components/Others/AboutModal",
    component: AboutModal,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "About modal with PWA service worker update check. " +
                    "Displays the application name, version and any " +
                    "additional fields, and lets the user trigger an " +
                    "update check via navigator.serviceWorker. All labels " +
                    "are overridable via the `labels` prop so the consumer " +
                    "controls i18n.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        open: { control: "boolean", table: { category: "Main" } },
        appName: { control: "text", table: { category: "Main" } },
        version: { control: "text", table: { category: "Main" } },
        fields: { control: "object", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onClose: { action: "closed", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def, WithFields as Wf } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const WithFields = { tags: ["!dev"], ...Wf };

export { AboutModal } from "./stories";
