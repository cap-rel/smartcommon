import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { Page } from "./";
import { fr } from "lib/locales";

const location = { pathname: "/" };

describe("Page - compact header", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders no header when no header prop is given", () => {
        const { container } = render(<Page location={location}>content</Page>);
        expect(container.querySelector("header")).toBeNull();
        expect(screen.getByText("content")).toBeTruthy();
    });

    it("renders title, icon and actions", () => {
        render(
            <Page
                location={location}
                title="Interventions"
                icon={<i data-testid="page-icon" />}
                actions={() => <button type="button">Add</button>}
            />
        );

        expect(screen.getByRole("heading", { level: 1, name: "Interventions" })).toBeTruthy();
        expect(screen.getByTestId("page-icon")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
    });

    it("calls onBack instead of history.back", () => {
        const onBack = vi.fn();
        const historyBack = vi.spyOn(window.history, "back").mockImplementation(() => {});

        render(<Page location={location} title="Detail" onBack={onBack} />);
        fireEvent.click(screen.getByRole("button", { name: "Back" }));

        expect(onBack).toHaveBeenCalledTimes(1);
        expect(historyBack).not.toHaveBeenCalled();
    });

    it("falls back to history.back with showBack alone", () => {
        const historyBack = vi.spyOn(window.history, "back").mockImplementation(() => {});

        render(<Page location={location} showBack />);
        fireEvent.click(screen.getByRole("button", { name: "Back" }));

        expect(historyBack).toHaveBeenCalledTimes(1);
    });

    it("translates the back button through labels", () => {
        render(<Page location={location} showBack labels={fr.Page} />);
        expect(screen.getByRole("button", { name: "Retour" })).toBeTruthy();
    });

    it("merges a top-level className onto the page container", () => {
        const { container } = render(<Page location={location} className="bg-red-500">x</Page>);
        const page = container.querySelector("[data-component='Page']");
        expect(page.className).toContain("bg-red-500");
        expect(page.className).not.toContain("bg-medium-bg");
    });
});
