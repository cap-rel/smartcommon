import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";

import { RoutingAnimationLayout } from "./";

// Recent happy-dom versions implement element.animate(): framer-motion then
// runs the opacity animations natively, and an animation still running when
// a test unmounts is cancelled with an AbortError rejection nobody listens
// to, which fails the run ("unhandled errors"). Without element.animate
// framer-motion falls back to its JS engine, which has no such promise.
// framer-motion reads this once, at the first animation of the file.
const nativeAnimate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");

beforeAll(() => {
    if (nativeAnimate) delete Element.prototype.animate;
});

afterAll(() => {
    if (nativeAnimate) Object.defineProperty(Element.prototype, "animate", nativeAnimate);
});

// A slow exit keeps the leaving page on screen long enough to inspect it.
const animationsConfig = {
    animations: {
        slow: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
        },
    },
    pages: { "*": "slow" },
};

const renderApp = () => render(
    <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route element={<RoutingAnimationLayout animationsConfig={animationsConfig} />}>
                <Route path="/" element={<div><p>List page</p><Link to="/detail">open</Link></div>} />
                <Route path="/detail" element={<p>Detail page</p>} />
            </Route>
        </Routes>
    </MemoryRouter>
);

const Filtered = () => {
    const [params] = useSearchParams();
    return (
        <div>
            <p>{`Filter: ${params.get("status") ?? "all"}`}</p>
            <Link to="/?status=open">only open</Link>
        </div>
    );
};

describe("RoutingAnimationLayout", () => {
    it("renders the matched child route", () => {
        renderApp();
        expect(screen.getByText("List page")).toBeTruthy();
    });

    it("keeps the leaving page's own content during its exit animation", async () => {
        renderApp();
        fireEvent.click(screen.getByText("open"));

        // While the list page animates out it must still show the list, not
        // a second copy of the page that is coming in.
        expect(screen.getByText("List page")).toBeTruthy();
        expect(screen.queryAllByText("Detail page").length).toBeLessThanOrEqual(1);

        // Once the exit is over, only the new page remains.
        await waitFor(() => {
            expect(screen.queryByText("List page")).toBeNull();
            expect(screen.getAllByText("Detail page")).toHaveLength(1);
        }, { timeout: 3000 });
    });

    it("still updates a page whose search params change on the same path", async () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route element={<RoutingAnimationLayout animationsConfig={animationsConfig} />}>
                        <Route path="/" element={<Filtered />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText("Filter: all")).toBeTruthy();
        fireEvent.click(screen.getByText("only open"));
        await waitFor(() => expect(screen.getByText("Filter: open")).toBeTruthy());
    });
});
