import { setDefaultStory } from "../../../../../storybook";
import { ConfirmDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import { ConfirmProvider, useConfirm } from "@cap-rel/smartcommon";

            // Once, under <Provider>:
            <ConfirmProvider labels={{ cancel: "Annuler", confirm: "OK" }}>
              <App />
            </ConfirmProvider>

            // In any page:
            const { confirm } = useConfirm();
            if (await confirm({ type: "danger", title: "Delete this intervention?", confirmText: "Delete" })) {
              remove();
            }
        `,
    }),
    render: () => <ConfirmDemo labels={{ cancel: "Cancel", confirm: "OK" }} />,
};
