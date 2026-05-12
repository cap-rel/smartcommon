/* eslint-disable react-refresh/only-export-components -- Storybook decorators
   intentionally co-locate components + helper exports for ergonomics. */
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ApiContext } from "lib/components";

// Wrap stories in a MemoryRouter so <Navigate /> has somewhere to go and
// the routes ("/login", "/" and "/protected") are resolvable.
export const routerDecorator = (Story) => (
    <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
            <Route path="/login" element={<DemoPage label="login page" />} />
            <Route path="/" element={<DemoPage label="home page" />} />
            <Route path="/protected" element={<Story />} />
        </Routes>
    </MemoryRouter>
);

// Provide an ApiContext so RouteGuard can read api.user. The story args
// (passed via parameters.fakeUser) are read via a small helper component
// instead of a parameterised decorator to keep the wiring simple.
export const apiDecorator = (Story, ctx) => {
    const fakeUser = ctx?.parameters?.fakeUser ?? null;
    const fakeApi = { user: fakeUser ?? undefined };
    return (
        <ApiContext.Provider value={fakeApi}>
            <Story />
        </ApiContext.Provider>
    );
};

const DemoPage = ({ label }) => (
    <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
        ↪ {label}
    </div>
);
