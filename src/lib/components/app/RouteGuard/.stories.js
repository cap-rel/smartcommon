import { RouteGuard } from "./";
import { routerDecorator, apiDecorator } from "./decorators";

export default {
    title: "Components/App/RouteGuard",
    component: RouteGuard,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Drop-in replacement for the per-project " +
                    "`PrivatePagesLayout` / `PublicPagesLayout` boilerplate. " +
                    "Reads `useApi().user` and either renders its children " +
                    "(or `<Outlet />` if used as a route element) or " +
                    "redirects via react-router `<Navigate>`. " +
                    "Use `requireAuth` for protected pages and `requireGuest` " +
                    "for /login, /register etc.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    decorators: [apiDecorator, routerDecorator],
    argTypes: {
        requireAuth: { control: "boolean", table: { category: "Main" } },
        requireGuest: { control: "boolean", table: { category: "Main" } },
        redirectTo: { control: "text", table: { category: "Main" } },
    },
    args: {},
};

import {
    RequireAuthAllowed as Raa,
    RequireAuthBlocked as Rab,
    RequireGuestAllowed as Rga,
    RequireGuestBlocked as Rgb,
} from "./stories";

export const RequireAuthAllowed = { tags: ["!dev"], ...Raa };
export const RequireAuthBlocked = { tags: ["!dev"], ...Rab };
export const RequireGuestAllowed = { tags: ["!dev"], ...Rga };
export const RequireGuestBlocked = { tags: ["!dev"], ...Rgb };

export { RouteGuard } from "./stories";
