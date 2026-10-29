import { setDefaultStory } from "../../../../../storybook";
import { InstallPromptDemo } from "./Demo";

export const Modal = {
    ...setDefaultStory({
        code: `
            <InstallPrompt variant="modal" />
        `,
    }),
    render: () => <InstallPromptDemo variant="modal" />,
};
