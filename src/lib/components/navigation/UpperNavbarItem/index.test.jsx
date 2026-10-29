import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { UpperNavbarItem } from "./";

describe("UpperNavbarItem - onClick", () => {
    it("calls the top-level onClick", () => {
        const onClick = vi.fn();
        render(<UpperNavbarItem label="Menu" onClick={onClick} />);

        fireEvent.click(screen.getByText("Menu"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls linkProps.onClick then the top-level onClick", () => {
        const calls = [];
        render(
            <UpperNavbarItem
                label="Menu"
                linkProps={{ onClick: () => calls.push("link") }}
                onClick={() => calls.push("top")}
            />
        );

        fireEvent.click(screen.getByText("Menu"));
        expect(calls).toEqual(["link", "top"]);
    });
});

describe("UpperNavbarItem - badge", () => {
    it("renders a count in the badge", () => {
        render(<UpperNavbarItem label="Alerts" badge={4} />);
        expect(screen.getByTestId("badge").textContent).toBe("4");
    });

    it("renders no badge for 0", () => {
        render(<UpperNavbarItem label="Alerts" badge={0} />);
        expect(screen.queryByTestId("badge")).toBeNull();
    });

    it("caps a large count", () => {
        render(<UpperNavbarItem label="Alerts" badge="120" />);
        expect(screen.getByTestId("badge").textContent).toBe("99+");
    });
});
