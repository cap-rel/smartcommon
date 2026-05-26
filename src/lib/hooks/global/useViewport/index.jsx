import { useContext } from "react";

import { ViewportContext } from "lib/components";

export const useViewport = () => {
    const ctx = useContext(ViewportContext);
    if (!ctx) {
        throw new Error(
            "useViewport must be used inside <ViewportProvider>. " +
            "Wrap <App /> with <ViewportProvider>.",
        );
    }
    return ctx;
};
