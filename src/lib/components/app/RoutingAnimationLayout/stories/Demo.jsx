import { Link, MemoryRouter, Route, Routes } from "react-router-dom";

import { RoutingAnimationLayout } from "../";

const animationsConfig = {
    animations: {
        fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } },
        slide: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "-100%" }, transition: { duration: 0.35 } },
    },
    // Page -> animation: "/detail" slides in, everything else fades.
    pages: { "/detail": "slide", "*": "fade" },
};

const Screen = ({ title, to, linkLabel }) => (
    <div className="flex flex-col gap-app-sm p-app-base h-full bg-soft-bg border border-border rounded-app-md">
        <strong>{title}</strong>
        <Link className="text-primary underline" to={to}>{linkLabel}</Link>
    </div>
);

// In an app RoutingAnimationLayout fills the screen (fixed inset-0); the demo
// keeps it in a frame through containerProps.
export const RoutingDemo = () => (
    <MemoryRouter initialEntries={["/"]}>
        <div className="relative w-80 h-40 overflow-hidden">
            <Routes>
                <Route
                    element={
                        <RoutingAnimationLayout
                            animationsConfig={animationsConfig}
                            containerProps={{ className: "absolute inset-0" }}
                        />
                    }
                >
                    <Route path="/" element={<Screen title="List of interventions" to="/detail" linkLabel="Open an intervention" />} />
                    <Route path="/detail" element={<Screen title="Intervention 42" to="/" linkLabel="Back to the list" />} />
                </Route>
            </Routes>
        </div>
    </MemoryRouter>
);
