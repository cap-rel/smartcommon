import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { Router } from "./index";

const Nav = () => {
    const navigate = useNavigate();
    return <button onClick={() => navigate("/target")}>go</button>;
};

const tree = (props = {}) => (
    <Router {...props}>
        <Routes>
            <Route path="*" element={<Nav />} />
        </Routes>
    </Router>
);

describe("Router", () => {
    beforeEach(() => {
        window.history.pushState({}, "", "/");
        if (window.location.hash) {
            window.location.hash = "";
        }
    });

    it("defaults to a browser router (navigation updates the pathname)", () => {
        render(tree());
        fireEvent.click(screen.getByText("go"));
        expect(window.location.pathname).toBe("/target");
        expect(window.location.hash).toBe("");
    });

    it("type='hash' mounts a hash router (navigation goes into the hash, not the pathname)", () => {
        render(tree({ type: "hash" }));
        fireEvent.click(screen.getByText("go"));
        expect(window.location.hash).toBe("#/target");
        expect(window.location.pathname).not.toBe("/target");
    });

    it("applies basename on the browser router", () => {
        window.history.pushState({}, "", "/app/");
        render(tree({ basename: "/app" }));
        fireEvent.click(screen.getByText("go"));
        expect(window.location.pathname).toBe("/app/target");
    });
});
