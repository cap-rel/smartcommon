import { fr } from "lib/locales";

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
        photoEditorLabels: { control: "object", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

// Same button in a French application: the form texts come from
// locales.fr.Feedback and the redaction editor texts (PhotoEditor) from
// locales.fr.PhotoEditor, through the photoEditorLabels prop.
export const French = {
    tags: ["!dev"],
    args: {
        relayPath: "feedback/report",
        visible: true,
        appVersion: "1.0.0",
        labels: fr.Feedback,
        photoEditorLabels: fr.PhotoEditor,
    },
    parameters: {
        docs: {
            description: {
                story:
                    "Localized usage: `labels` feeds the report form, " +
                    "`photoEditorLabels` feeds the redaction editor opened " +
                    "on the screenshot.",
            },
        },
    },
};

