import { RoutingAnimationLayout } from "./";

export default {
    title: "Components/App/RoutingAnimationLayout",
    component: RoutingAnimationLayout,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Layout route that animates the page change: put it as the " +
                    "`element` of a parent `<Route>`, it renders the child route " +
                    "(`<Outlet />`) and plays an enter / exit animation (framer-" +
                    "motion) each time the path changes. `animationsConfig." +
                    "animations` names the animations, `animationsConfig.pages` " +
                    "picks one per path (`\"*\"` for the others, or per previous " +
                    "path), `resolveAnimationKey` decides in code instead. " +
                    "Default: a short fade.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    argTypes: {
        animationsConfig: { control: "object", table: { category: "Main" } },
        mode: { control: "inline-radio", options: ["wait", "sync", "popLayout"], table: { category: "Main" } },
        prevPathname: { control: "text", table: { category: "Main" } },
        defaultAnimationKey: { control: "text", table: { category: "Main" } },
        resolveAnimationKey: { control: false, table: { category: "Main" } },
        containerProps: { control: "object", table: { category: "Elements" } },
        children: { control: false, table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
