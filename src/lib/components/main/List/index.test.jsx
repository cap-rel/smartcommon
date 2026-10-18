import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { List } from "./";

describe("List - SortButton slot", () => {
    it("forwards SortButton props to the sort button", () => {
        render(<List sortProps={[{}]} SortButton={{ buttonProps: { "aria-label": "Sort" } }} />);
        expect(screen.getByRole("button", { name: "Sort" })).toBeTruthy();
    });

    it("keeps the default icon when none is given", () => {
        render(<List sortProps={[{}]} SortButton={{ buttonProps: { "aria-label": "Sort" } }} />);
        expect(screen.getByRole("button", { name: "Sort" }).querySelector("svg")).toBeTruthy();
    });

    it("lets the consumer replace the icon", () => {
        const Custom = () => <i data-testid="custom-icon" />;
        render(<List sortProps={[{}]} SortButton={{ icon: Custom, buttonProps: { "aria-label": "Sort" } }} />);
        expect(screen.getByTestId("custom-icon")).toBeTruthy();
    });
});
