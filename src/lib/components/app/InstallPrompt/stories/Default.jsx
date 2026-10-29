import { setDefaultStory } from "../../../../../storybook";
import { InstallPromptDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import { InstallPrompt, openInstallPrompt } from "@cap-rel/smartcommon";

            // Once, in the app shell: offers the install after a few visits.
            <InstallPrompt variant="banner" minVisits={2} />

            // From a menu entry: open it on demand.
            <Button label="Install the app" onClick={openInstallPrompt} />
        `,
    }),
    render: () => <InstallPromptDemo variant="banner" />,
};
