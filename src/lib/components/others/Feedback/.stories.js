import { FeedbackButton } from "./";

export default {
    title: "Components/Others/FeedbackButton",
    component: FeedbackButton,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Report a problem from a PWA: a button opening a modal " +
                    "form that posts a multipart report (context, log " +
                    "excerpt, network errors, optional redacted screenshot) " +
                    "to a module relay. The relay forwards it to capTests " +
                    "with the intake key; the key never reaches the browser. " +
                    "Offline, the report is queued and sent when the network " +
                    "returns, with the same idempotency key.",
            },
        },
    },
    tags: ["Others"],
    argTypes: {
        relayPath: { control: "text", table: { category: "Main" } },
        visible: { control: "boolean", table: { category: "Main" } },
        appVersion: { control: "text", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

