import { fn } from "storybook/test";
import { FaPlus } from "react-icons/fa6";

import { FAB } from "./";

export default {
    title: "Components/Others/FAB",
    component: FAB,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Floating Action Button: a fixed, circular, icon-only " +
                    "action trigger (the '+' add button at the bottom of a " +
                    "list). Sizes its glyph in explicit pixels so it stays " +
                    "visible whatever the surrounding theme. It renders with " +
                    "position: fixed, so it anchors to the bottom corner of " +
                    "the viewport (use the 'fullscreen' layout to see it). " +
                    "Pass `actions` to turn it into a speed-dial (see the " +
                    "SpeedDial story).",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        icon: {
            control: false,
            table: { category: "Appearance" },
        },
        color: {
            control: "inline-radio",
            options: ["primary", "secondary"],
            table: { category: "Appearance" },
        },
        size: {
            control: "number",
            table: { category: "Appearance" },
        },
        iconSize: {
            control: "number",
            table: { category: "Appearance" },
        },
        position: {
            control: "inline-radio",
            options: ["bottom-right", "bottom-left"],
            table: { category: "Main" },
        },
        label: {
            control: "text",
            table: { category: "Main" },
        },
        actions: {
            control: "object",
            table: { category: "Speed-dial" },
        },
        direction: {
            control: "inline-radio",
            options: ["up", "down", "left", "right"],
            table: { category: "Speed-dial" },
        },
        isOpen: {
            control: false,
            table: { category: "Speed-dial" },
        },
        onOpenChange: {
            control: false,
            table: { category: "Events" },
        },
        onClick: {
            table: { category: "Events" },
        },
        children: {
            control: false,
            table: { category: "Main" },
        },
        buttonProps: {
            table: { category: "Elements" },
        },
    },
    args: { onClick: fn() },
};

import { Default as Def, SpeedDial as Sd } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const SpeedDial = { tags: ["!dev"], ...Sd };
