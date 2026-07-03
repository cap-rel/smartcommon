import { ApiContext } from "lib/components";

// Storybook decorator: provide a fake ApiContext so usePushNotifications (which
// consumes useApi) renders without a full Redux + LibConfig + smartAuth stack.
// The stubs resolve harmlessly; there is no Service Worker or backend in
// Storybook, so the toggle shows the current browser permission state only.
export const fakeApiDecorator = (Story) => {
    const fakeApi = {
        get: () => Promise.resolve({ subscriptions: [] }),
        post: () => Promise.resolve({ id: 1, message: "ok" }),
        del: () => Promise.resolve({ message: "ok" }),
        public: {
            get: () => ({ json: () => Promise.resolve({ publicKey: "" }) }),
        },
    };
    return (
        <ApiContext.Provider value={fakeApi}>
            <div className="max-w-md mx-auto p-6">
                <Story />
            </div>
        </ApiContext.Provider>
    );
};
