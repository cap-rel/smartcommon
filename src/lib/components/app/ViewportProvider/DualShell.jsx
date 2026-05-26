import { useContext } from "react";

import { ViewportContext } from "./context";

// Sugar helper: pick between mobile / tablet / desktop renders without
// a data layer in between. When data must be SHARED between viewports
// (typical case), do NOT use DualShell -- call useViewport() in your
// page component, fetch data there with a `useXxxData()` hook, then
// render the chosen view with the data passed as props.
//
// Fallback when the matching prop is missing:
//   - viewport "tablet": tablet ?? desktop ?? mobile ?? null
//   - viewport "mobile": mobile ?? null
//   - viewport "desktop": desktop ?? null
//
// Rationale for the tablet fallback: a tablet has more screen real
// estate than a phone, so a desktop layout typically fits better than
// a phone layout. If desktop isn't provided either, fall back to
// mobile rather than null so the app doesn't render blank.
//
// We intentionally read the context directly (not via useViewport) so
// the missing-provider error message stays "DualShell must be used
// inside <ViewportProvider>" -- pinned by the index.test.jsx contract
// and clearer than useViewport's "useViewport must be used..." in
// stack traces when DualShell is the offending call site.
export const DualShell = ({ mobile, tablet, desktop }) => {
    const ctx = useContext(ViewportContext);
    if (!ctx) {
        throw new Error(
            "DualShell must be used inside <ViewportProvider>. " +
            "Wrap <App /> with <ViewportProvider>.",
        );
    }
    if (ctx.isMobile) return mobile ?? null;
    if (ctx.isTablet) return tablet ?? desktop ?? mobile ?? null;
    if (ctx.isDesktop) return desktop ?? null;
    return null;
};
