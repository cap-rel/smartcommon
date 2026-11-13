/* eslint-disable react-refresh/only-export-components -- Storybook decorators
   co-locate the decorator and the helper component it renders. */
import { MemoryRouter, useLocation } from "react-router-dom";

import { NavigationContext } from "lib/components";

// Feeds useNavigation().location from the router, as NavigationProvider does
// in the root <Provider>, so the active entry follows the clicked link.
const RouterLocation = ({ children }) => {
    const location = useLocation();
    return (
        <NavigationContext.Provider value={{ location }}>
            {children}
            <main className="flex-1 min-w-0 p-app-base text-app-sm text-soft-text">
                Current route: <code>{location.pathname}</code>
            </main>
        </NavigationContext.Provider>
    );
};

// Storybook decorator: links are router links (LazyLink), they need a router.
// The shell has a bounded height: the sidebar takes it through
// asideProps (h-full) instead of the whole viewport (h-screen).
export const routerShellDecorator = (Story) => (
    <MemoryRouter initialEntries={["/interventions/42"]}>
        <div className="flex h-[420px] overflow-hidden bg-medium-bg">
            <RouterLocation>
                <Story />
            </RouterLocation>
        </div>
    </MemoryRouter>
);
