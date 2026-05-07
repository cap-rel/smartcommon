import { DeviceIdentificationComponent } from "./";
import { fakeApiDecorator } from "./decorators";

export default {
    title: "Components/Others/DeviceIdentificationComponent",
    component: DeviceIdentificationComponent,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Generic device identification form. Reads " +
                    "`useApi().user.deviceOptions` and either lets the user " +
                    "pick from existing devices (radio) or register a brand " +
                    "new one (label input). On submit, calls " +
                    "`api.identifyDevice({ label, uuid })` which clears " +
                    "`deviceOptions` from the global state automatically. " +
                    "Each project keeps its own DeviceIdentificationPage for " +
                    "branding/layout and injects this component for the form.",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    decorators: [fakeApiDecorator],
    argTypes: {
        noDeviceValue: { control: "text", table: { category: "Main" } },
        identifyTimeoutMs: { control: "number", table: { category: "Main" } },
        abortTimeoutMs: { control: "number", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onSuccess: { action: "success", table: { category: "Events" } },
        onError: { action: "error", table: { category: "Events" } },
    },
    args: {},
};

import {
    NoDeviceOptions as Ndo,
    WithDeviceOptions as Wdo,
} from "./stories";

export const NoDeviceOptions = { tags: ["!dev"], ...Ndo };
export const WithDeviceOptions = { tags: ["!dev"], ...Wdo };

export { DeviceIdentificationComponent } from "./stories";
