import { useState } from "react";

import { Button } from "lib/components";
import { ErrorBoundary } from "../";

// Throws during render while `armed`: the way a real rendering bug reaches an
// error boundary (an event handler error would not).
const Fragile = ({ armed }) => {
    if (armed) throw new Error("Cannot read properties of undefined (reading 'name')");
    return <p className="text-app-sm">The protected section renders normally.</p>;
};

export const CustomFallback = ({ error, resetError }) => (
    <div className="flex flex-col gap-app-xs p-app-base rounded-app-md border border-border bg-medium-bg">
        <strong>This section could not be displayed.</strong>
        <span className="text-app-sm text-soft-text">{error?.message}</span>
        <Button size="sm" label="Reload the section" onClick={resetError} />
    </div>
);

// The button sits outside the boundary; the boundary disarms the child once
// it has caught the error, so "retry" renders it again without a loop.
export const ErrorBoundaryDemo = ({ FallbackComponent }) => {
    const [armed, setArmed] = useState(false);

    return (
        <div className="flex flex-col gap-app-base w-96">
            <Button label="Make the section crash" onClick={() => setArmed(true)} />
            <ErrorBoundary FallbackComponent={FallbackComponent} onError={() => setArmed(false)}>
                <Fragile armed={armed} />
            </ErrorBoundary>
        </div>
    );
};
