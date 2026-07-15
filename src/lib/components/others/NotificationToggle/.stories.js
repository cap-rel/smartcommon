import { NotificationToggle } from "./";
import { fakeApiDecorator } from "./decorators";

export default {
    title: "Components/Others/NotificationToggle",
    component: NotificationToggle,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Self-contained enable/disable control for Web Push " +
                    "notifications, backed by usePushNotifications. It renders " +
                    "the UI for the current permission state ('unsupported' / " +
                    "'denied' -> a message, 'default' / 'granted' -> a " +
                    "checkbox). In Storybook there is no Service Worker or " +
                    "backend, so it shows the browser's current permission " +
                    "state; live subscribe/unsubscribe needs a real SW plus " +
                    "the smartAuth /push endpoints.",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    decorators: [fakeApiDecorator],
    argTypes: {
        label: {
            control: "text",
            table: { category: "Main" },
        },
        labels: {
            control: "object",
            table: { category: "Appearance" },
        },
        containerProps: {
            table: { category: "Elements" },
        },
        className: {
            control: "text",
            table: { category: "Elements" },
        },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
