import { DesktopHeader } from "./";
import { pageDecorator } from "./decorators";
import { fakeSessionDecorator } from "../UserMenu/decorators";

export default {
    title: "Components/Navigation/DesktopHeader",
    component: DesktopHeader,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Standard top bar of a desktop page: optional back " +
                    "button, title with subtitle and breadcrumb on the " +
                    "left, a centred search slot, page actions then the " +
                    "UserMenu on the right. Bottom border, no shadow, " +
                    "shrink-0 above a flex-1 min-h-0 body.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Navigation"],
    decorators: [pageDecorator, fakeSessionDecorator],
    argTypes: {
        title: { control: "text", table: { category: "Main" } },
        titleAs: { control: "text", table: { category: "Main" } },
        subtitle: { control: "text", table: { category: "Main" } },
        breadcrumb: { control: false, table: { category: "Main" } },
        search: { control: false, table: { category: "Main" } },
        actions: { control: false, table: { category: "Main" } },
        showUserMenu: { control: "boolean", table: { category: "Appearance" } },
        labels: { control: "object", table: { category: "Main" } },
        onBack: { control: false, table: { category: "Events" } },
        headerProps: { control: false, table: { category: "Elements" } },
        backButtonProps: { control: false, table: { category: "Elements" } },
        titleProps: { control: false, table: { category: "Elements" } },
        subtitleProps: { control: false, table: { category: "Elements" } },
        searchProps: { control: false, table: { category: "Elements" } },
        actionsProps: { control: false, table: { category: "Elements" } },
        UserMenu: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, WithBreadcrumb as Wb, WithoutUserMenu as Wum } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const WithBreadcrumb = { tags: ["!dev"], ...Wb };
export const WithoutUserMenu = { tags: ["!dev"], ...Wum };
