export const NoDeviceOptions = {
    args: {},
    parameters: {
        fakeUser: { id: 1, email: "alice@example.com" },
        docs: {
            description: {
                story:
                    "First-time user without any registered device. The " +
                    "form falls back to a single label input.",
            },
            source: {
                code: `
import { DeviceIdentificationComponent } from "@cap-rel/smartcommon";

<DeviceIdentificationComponent
  onSuccess={(data) => navigate("/")}
/>
                `,
            },
        },
    },
};
