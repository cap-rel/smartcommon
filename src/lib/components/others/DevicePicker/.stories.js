import { DevicePicker } from "./";
import { containerDecorator } from "./decorators";

export default {
    title: "Components/Others/DevicePicker",
    component: DevicePicker,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Picker shown after a successful login when the current " +
                    "technical device is not yet attached to a logical " +
                    "user-device. The user either picks one of their existing " +
                    "user-devices (the same one used by their other PWAs on " +
                    "the same iPhone, for instance) or creates a new one. " +
                    "Pure UI component: the parent wires onPick / onCreate to " +
                    "the smartAuth /account/user-devices endpoints.",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    decorators: [containerDecorator],
    argTypes: {
        existingDevices: { control: "object", table: { category: "Main" } },
        loading: { control: "boolean", table: { category: "Main" } },
        error: { control: "text", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onPick: { action: "pick", table: { category: "Events" } },
        onCreate: { action: "create", table: { category: "Events" } },
        onCancel: { action: "cancel", table: { category: "Events" } },
    },
    args: {},
};

import {
    Empty as Emp,
    WithExisting as Wex,
} from "./stories";

export const Empty = { tags: ["!dev"], ...Emp };
export const WithExisting = { tags: ["!dev"], ...Wex };

export { DevicePicker } from "./stories";
