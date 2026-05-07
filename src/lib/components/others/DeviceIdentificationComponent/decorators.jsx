import { ApiContext } from "lib/components";

// Storybook decorator: provide a fake ApiContext with deviceOptions so the
// component renders without needing a real backend. Each story can pass
// `parameters.fakeUser` to override the user shape.
export const fakeApiDecorator = (Story, ctx) => {
    const fakeUser = ctx?.parameters?.fakeUser ?? null;
    const fakeApi = {
        user: fakeUser ?? undefined,
        identifyDevice: () => Promise.reject(new Error("storybook: no real backend")),
    };
    return (
        <ApiContext.Provider value={fakeApi}>
            <div className="max-w-md mx-auto p-6">
                <Story />
            </div>
        </ApiContext.Provider>
    );
};
