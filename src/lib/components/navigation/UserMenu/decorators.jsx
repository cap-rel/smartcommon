import { fn } from "storybook/test";

import { ApiContext, GlobalStatesContext, NavigationContext } from "lib/components";

const DEMO_USER = { username: "alice.martin", email: "alice.martin@example.com" };

// Settings navigates through useNavigation().replace().to(path): record the
// path in the Actions panel instead of leaving the docs page.
const navigateTo = fn().mockName("navigation.replace().to");

// Storybook decorator: a fake session so the menu works as inside the root
// <Provider>. The global state holds a user (read when no `user` prop is
// given) and api.logout() resolves after a short delay, which shows the
// "Logging out..." state of the entry.
export const fakeSessionDecorator = (Story) => {
    const fakeApi = {
        logout: () => new Promise((resolve) => {
            setTimeout(resolve, 1200);
        }),
    };
    const fakeGst = {
        get: (key) => (key === "user" ? DEMO_USER : undefined),
    };
    const fakeNav = {
        replace: () => ({ to: navigateTo }),
    };
    return (
        <ApiContext.Provider value={fakeApi}>
            <GlobalStatesContext.Provider value={fakeGst}>
                <NavigationContext.Provider value={fakeNav}>
                    <Story />
                </NavigationContext.Provider>
            </GlobalStatesContext.Provider>
        </ApiContext.Provider>
    );
};

// Leave room under the trigger for the menu, aligned right like in a header.
export const menuAreaDecorator = (Story) => (
    <div className="min-h-[220px] p-app-base flex justify-end items-start">
        <Story />
    </div>
);
