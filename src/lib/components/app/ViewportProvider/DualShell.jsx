import { useContext } from "react";

import { ViewportContext } from "./context";

// Sugar helper: pick between two views without a data layer in between.
// When data must be SHARED between mobile and desktop (typical case), do
// NOT use DualShell -- call useViewport() in your page component, fetch
// data there with a `useXxxData()` hook, then render the chosen view with
// the data passed as props.
export const DualShell = ({ mobile, desktop }) => {
    const ctx = useContext(ViewportContext);
    if (!ctx) {
        // Fail loud, same contract as useViewport(): a missing provider
        // would silently render the mobile branch and hide layout bugs.
        throw new Error(
            "DualShell must be used inside <ViewportProvider>. " +
            "Wrap <App /> with <ViewportProvider>.",
        );
    }
    return ctx.isDesktop ? (desktop ?? null) : (mobile ?? null);
};
