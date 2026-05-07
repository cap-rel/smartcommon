import { ApiContext } from "lib/components";

// Storybook decorator: provide a fake ApiContext so the component renders
// without needing a full Redux + LibConfig + smartAuth stack.
export const fakeApiDecorator = (Story) => {
    const fakeApi = {
        login: () => Promise.reject(new Error("storybook: no real backend")),
        getEntities: () => Promise.resolve({ entities: [] }),
        claimQrPair: () => Promise.reject(new Error("storybook: no real backend")),
        pollQrPair: () => Promise.reject(new Error("storybook: no real backend")),
    };
    return (
        <ApiContext.Provider value={fakeApi}>
            <div className="max-w-md mx-auto p-6">
                <Story />
            </div>
        </ApiContext.Provider>
    );
};
