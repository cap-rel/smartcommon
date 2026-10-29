import { ViewportProvider } from "./";

export default {
    title: "Components/App/ViewportProvider",
    component: ViewportProvider,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Decides once per session whether the app shows its " +
                    "mobile, tablet or desktop layout, and shares it through " +
                    "`useViewport()` (`viewport`, `isMobile`, `isTablet`, " +
                    "`isDesktop`, `preference`, `setPreference`). In `auto` " +
                    "the primary pointer decides (mouse or trackpad: desktop), " +
                    "then the screen size. The user can force a layout with " +
                    "`setPreference(\"mobile\" | \"tablet\" | \"desktop\" | " +
                    "\"auto\")`: stored on the device, it reloads the app after " +
                    "a confirmation (`labels.confirmReloadMessage`). " +
                    "`DualShell` picks one render per layout. Not mounted by " +
                    "`<Provider>`: wrap the app with it yourself.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    argTypes: {
        children: { control: false, table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onPreferenceChange: { control: false, table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
