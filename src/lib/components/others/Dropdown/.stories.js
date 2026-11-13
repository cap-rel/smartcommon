import { Dropdown } from "./";
import { menuAreaDecorator } from "./decorators";

export default {
    title: "Components/Others/Dropdown",
    component: Dropdown,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Click-triggered menu for desktop screens: user menu, " +
                    "kebab / overflow actions on a row or a card. The menu " +
                    "is position: fixed under its trigger, so it escapes " +
                    "the clipping of scroll containers, and follows the " +
                    "WAI-ARIA menu button pattern (arrows, Home / End, " +
                    "Escape, Tab).",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    decorators: [menuAreaDecorator],
    argTypes: {
        items: { control: "object", table: { category: "Main" } },
        trigger: { control: false, table: { category: "Main" } },
        align: {
            control: { type: "select" },
            options: ["right", "left"],
            table: { category: "Appearance" },
        },
        menuClassName: { control: "text", table: { category: "Appearance" } },
        zIndex: { control: "number", table: { category: "Appearance" } },
        testId: { control: "text", table: { category: "Main" } },
        triggerWrapperProps: { control: false, table: { category: "Elements" } },
        menuProps: { control: false, table: { category: "Elements" } },
        itemProps: { control: false, table: { category: "Elements" } },
        dividerProps: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, RenderTrigger as Rt, TextTrigger as Tt } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const RenderTrigger = { tags: ["!dev"], ...Rt };
export const TextTrigger = { tags: ["!dev"], ...Tt };
