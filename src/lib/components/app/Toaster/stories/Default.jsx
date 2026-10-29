import { setDefaultStory } from "../../../../../storybook";
import { ToasterDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import toast from "react-hot-toast";

            // <Toaster /> is already mounted by <Provider>: just emit toasts.
            toast.success("Intervention saved");
            toast.error("The server did not answer");
        `,
    }),
    render: () => <ToasterDemo />,
};
