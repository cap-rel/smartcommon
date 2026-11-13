import { UserMenu } from "./";
import { fakeSessionDecorator, menuAreaDecorator } from "./decorators";

export default {
    title: "Components/Navigation/UserMenu",
    component: UserMenu,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Desktop user menu, pinned top right by DesktopHeader: " +
                    "avatar (initials) and name, then a Dropdown with " +
                    "Settings and Log out. Works without props inside the " +
                    "root <Provider>; each behaviour can be replaced " +
                    "(user, onSettings, onLogout) and items adds entries.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Navigation"],
    decorators: [menuAreaDecorator, fakeSessionDecorator],
    argTypes: {
        user: { control: "object", table: { category: "Main" } },
        items: { control: false, table: { category: "Main" } },
        showSettings: { control: "boolean", table: { category: "Main" } },
        settingsPath: { control: "text", table: { category: "Main" } },
        logoutTimeoutMs: { control: "number", table: { category: "Behavior" } },
        align: {
            control: { type: "select" },
            options: ["right", "left"],
            table: { category: "Appearance" },
        },
        testId: { control: "text", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onSettings: { control: false, table: { category: "Events" } },
        onLogout: { control: false, table: { category: "Events" } },
        triggerProps: { control: false, table: { category: "Elements" } },
        avatarProps: { control: false, table: { category: "Elements" } },
        Dropdown: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, CustomEntries as Ce, French as Fr } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const CustomEntries = { tags: ["!dev"], ...Ce };
export const French = { tags: ["!dev"], ...Fr };
