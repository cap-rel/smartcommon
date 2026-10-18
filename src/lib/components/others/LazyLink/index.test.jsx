import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import { LazyLink } from "./";

const Target = () => {
    const location = useLocation();
    return <div>target page {JSON.stringify(location.state)}</div>;
};

const renderAt = (link) => render(
    <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route path="/" element={link} />
            <Route path="/target" element={<Target />} />
            <Route path="/slot" element={<div>slot page</div>} />
        </Routes>
    </MemoryRouter>
);

describe("LazyLink", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("renders a real link to the target", () => {
        renderAt(<LazyLink to="/target">Go</LazyLink>);
        expect(screen.getByRole("link", { name: "Go" }).getAttribute("href")).toBe("/target");
    });

    it("navigates after the duration, with state", () => {
        const onClick = vi.fn();
        renderAt(<LazyLink to="/target" state={{ from: "home" }} duration={300} onClick={onClick}>Go</LazyLink>);

        fireEvent.click(screen.getByRole("link", { name: "Go" }));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/target page/)).toBeNull();

        act(() => vi.advanceTimersByTime(300));
        expect(screen.getByText('target page {"from":"home"}')).toBeTruthy();
    });

    it("cancels the navigation when onClick prevents the default", () => {
        renderAt(<LazyLink to="/target" onClick={e => e.preventDefault()}>Go</LazyLink>);

        fireEvent.click(screen.getByRole("link", { name: "Go" }));
        act(() => vi.runAllTimers());
        expect(screen.queryByText(/target page/)).toBeNull();
    });

    it("gives priority to the Link slot", () => {
        renderAt(<LazyLink to="/target" Link={{ to: "/slot" }}>Go</LazyLink>);

        fireEvent.click(screen.getByRole("link", { name: "Go" }));
        act(() => vi.runAllTimers());
        expect(screen.getByText("slot page")).toBeTruthy();
    });

    it("leaves modified clicks to the browser", () => {
        renderAt(<LazyLink to="/target">Go</LazyLink>);

        fireEvent.click(screen.getByRole("link", { name: "Go" }), { ctrlKey: true });
        act(() => vi.runAllTimers());
        expect(screen.queryByText(/target page/)).toBeNull();
    });
});
