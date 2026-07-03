import { fn } from "storybook/test";

import { PinPad } from "./";

import * as variants from "./variants";

export default {
    title: "Components/Form/PinPad",
    component: PinPad,
    parameters: {
        docs: {
            codePanel: true,
        },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        variant: {
            control: "inline-check",
            options: Object.keys(variants),
            table: { category: "Main" },
        },
        tone: {
            control: "inline-radio",
            options: ["light", "dark"],
            table: { category: "Main" },
        },
        value: {
            table: { category: "Form" },
        },
        minLength: {
            control: "number",
            table: { category: "Form" },
        },
        maxLength: {
            control: "number",
            table: { category: "Form" },
        },
        error: {
            control: "boolean",
            table: { category: "Appearance" },
        },
        disabled: {
            control: "boolean",
            table: { category: "Appearance" },
        },
        onChange: {
            table: { category: "Events" },
        },
        onSubmit: {
            table: { category: "Events" },
        },
        labels: {
            control: false,
            table: { category: "Appearance" },
        },
        containerProps: {
            table: { category: "Elements" },
        },
    },
    args: { onChange: fn(), onSubmit: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
