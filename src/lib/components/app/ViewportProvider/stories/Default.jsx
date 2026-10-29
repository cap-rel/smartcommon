import { setDefaultStory } from "../../../../../storybook";
import { ViewportDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import { ViewportProvider, DualShell, useViewport } from "@cap-rel/smartcommon";

            // Once, under <Provider>:
            <ViewportProvider labels={locales.fr.ViewportProvider}>
              <App />
            </ViewportProvider>

            // A page with one layout per device:
            <DualShell mobile={<ListMobile />} tablet={<ListTablet />} desktop={<ListDesktop />} />

            // Or read it to share data between layouts:
            const { viewport, isMobile, setPreference } = useViewport();
        `,
    }),
    render: () => <ViewportDemo />,
};
