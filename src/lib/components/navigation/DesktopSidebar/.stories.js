import { DesktopSidebar } from "./";
import { routerShellDecorator } from "./decorators";

export default {
    title: "Components/Navigation/DesktopSidebar",
    component: DesktopSidebar,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Persistent desktop sidebar: primary navigation on the " +
                    "left (the same entries as the mobile Tabbar), " +
                    "collapsible to an icon rail. The collapse state is " +
                    "kept in localStorage and survives a reload, unless " +
                    "the parent owns it (collapsed + onCollapsedChange).",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Navigation"],
    decorators: [routerShellDecorator],
    argTypes: {
        links: { control: false, table: { category: "Main" } },
        brand: { control: false, table: { category: "Main" } },
        footer: { control: false, table: { category: "Main" } },
        collapsed: { control: "boolean", table: { category: "Behavior" } },
        defaultCollapsed: { control: "boolean", table: { category: "Behavior" } },
        storageKey: { control: "text", table: { category: "Behavior" } },
        isActive: { control: false, table: { category: "Behavior" } },
        labels: { control: "object", table: { category: "Main" } },
        onCollapsedChange: { control: false, table: { category: "Events" } },
        asideProps: { control: false, table: { category: "Elements" } },
        brandProps: { control: false, table: { category: "Elements" } },
        navProps: { control: false, table: { category: "Elements" } },
        linkProps: { control: false, table: { category: "Elements" } },
        iconGlyphProps: { control: false, table: { category: "Elements" } },
        badgeProps: { control: false, table: { category: "Elements" } },
        footerProps: { control: false, table: { category: "Elements" } },
        toggleProps: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, Collapsed as Col, Controlled as Ctl } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Collapsed = { tags: ["!dev"], ...Col };
export const Controlled = { tags: ["!dev"], ...Ctl };
