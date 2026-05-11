// Storybook decorator for DevicePicker. Unlike LoginComponent or
// DeviceIdentificationComponent, DevicePicker is a pure UI component
// that doesn't touch useApi -- the calls to /account/user-devices
// happen in the parent (LoginComponent / RouteGuard). So we just wrap
// the story in a sane max-width container for centred display.
export const containerDecorator = (Story) => (
    <div className="max-w-md mx-auto p-6">
        <Story />
    </div>
);
