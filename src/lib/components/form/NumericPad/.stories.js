import { fn } from "storybook/test";

import { NumericPad } from "./";

import * as variants from "./variants";

export default {
    title: "Components/Form/NumericPad",
    component: NumericPad,
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
        mode: {
            control: "inline-radio",
            options: ["integer", "decimal"],
            table: { category: "Main" },
        },
        value: {
            table: { category: "Form" },
        },
        onChange: {
            table: { category: "Events" },
        },
        onConfirm: {
            table: { category: "Events" },
        },
        label: {
            table: { category: "Appearance" },
        },
        labels: {
            control: false,
            table: { category: "Appearance" },
        },
        backspaceIcon: {
            control: false,
            table: { category: "Appearance" },
        },
        confirmIcon: {
            control: false,
            table: { category: "Appearance" },
        },
        containerProps: {
            table: { category: "Elements" },
        },
    },
    args: { onChange: fn(), onConfirm: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
