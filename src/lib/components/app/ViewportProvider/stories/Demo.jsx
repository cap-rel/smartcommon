import { useViewport } from "lib/hooks";
import { ViewportProvider } from "../";
import { DualShell } from "../DualShell";

const Readout = () => {
    const { viewport, preference, isMobile, isTablet, isDesktop } = useViewport();
    return (
        <pre className="text-app-xs bg-medium-bg p-app-sm rounded-app-md">
            {JSON.stringify({ viewport, preference, isMobile, isTablet, isDesktop }, null, 2)}
        </pre>
    );
};

const Layout = ({ label }) => (
    <div className="p-app-base rounded-app-md border border-border text-app-sm">
        DualShell rendered the <strong>{label}</strong> layout
    </div>
);

// Shows what this browser is detected as. Changing the preference reloads
// the page, so the demo only reads it.
export const ViewportDemo = () => (
    <ViewportProvider>
        <div className="flex flex-col gap-app-sm w-80">
            <Readout />
            <DualShell
                mobile={<Layout label="mobile" />}
                tablet={<Layout label="tablet" />}
                desktop={<Layout label="desktop" />}
            />
        </div>
    </ViewportProvider>
);
