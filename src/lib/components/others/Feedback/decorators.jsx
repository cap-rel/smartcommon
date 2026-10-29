import { ApiContext } from "lib/components";

// Storybook decorator: a fake relay so the demo form can be sent. The answer
// mimics the module relay ({ ok, ref, tracking_url }); the tracking URL uses
// the reserved .example domain, it leads nowhere.
export const fakeRelayDecorator = (Story) => {
    let counter = 40;
    const fakeApi = {
        post: () => new Promise((resolve) => {
            counter += 1;
            setTimeout(() => resolve({
                ok: true,
                ref: `DEMO-${counter}`,
                tracking_url: `https://captests.example/suivi/DEMO-${counter}`,
            }), 600);
        }),
    };
    return (
        <ApiContext.Provider value={fakeApi}>
            <Story />
        </ApiContext.Provider>
    );
};
