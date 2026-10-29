import { ErrorBoundary } from "./";

export default {
    title: "Components/App/ErrorBoundary",
    component: ErrorBoundary,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Catches an error thrown while rendering its children and " +
                    "shows a fallback instead of a blank screen. `<Provider>` " +
                    "already wraps the whole app in one; add another around a " +
                    "fragile section (a heavy editor, a map) so a crash there " +
                    "keeps the rest of the page usable. Fallback, by priority: " +
                    "`FallbackComponent({ error, resetError })`, then the " +
                    "`fallback` element, then a default box with a retry " +
                    "button, whose texts come from `labels` (English by " +
                    "default, `locales.fr.ErrorBoundary` for French). " +
                    "`onError(error, errorInfo)` is called after the error is " +
                    "logged.",
            },
        },
        layout: "centered",
    },
    tags: ["App"],
    argTypes: {
        children: { control: false, table: { category: "Main" } },
        fallback: { control: false, table: { category: "Main" } },
        FallbackComponent: { control: false, table: { category: "Main" } },
        onError: { control: false, table: { category: "Events" } },
        labels: { control: "object", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def, CustomFallback as Cf } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const CustomFallback = { tags: ["!dev"], ...Cf };
