import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DesktopSplit } from "./index";

describe("DesktopSplit", () => {
    it("shows the placeholder until something is selected, then the detail", () => {
        const { rerender } = render(
            <DesktopSplit master={<p>list</p>} detail={<p>invoice 42</p>} placeholder={<p>pick an invoice</p>} />
        );
        expect(screen.getByTestId("desktop-split-master").textContent).toBe("list");
        expect(screen.getByTestId("desktop-split-detail").textContent).toBe("pick an invoice");

        rerender(
            <DesktopSplit master={<p>list</p>} detail={<p>invoice 42</p>} placeholder={<p>pick an invoice</p>} hasSelection />
        );
        expect(screen.getByTestId("desktop-split-detail").textContent).toBe("invoice 42");
    });

    it("keeps both panes side by side at any width, the master at its own width", () => {
        render(<DesktopSplit master="m" detail="d" hasSelection />);
        const master = screen.getByTestId("desktop-split-master");
        expect(master.className).toContain("w-[56%]");
        expect(master.className).not.toMatch(/\blg:/);
        expect(master.className).not.toContain("w-full");
        expect(screen.getByTestId("desktop-split").className).toContain("flex");
    });

    it("applies masterWidth, the extra classes and the testId", () => {
        render(
            <DesktopSplit
                master="m"
                detail="d"
                hasSelection
                masterWidth="w-[420px]"
                masterClassName="extra-master"
                detailClassName="p-4"
                testId="ints"
                masterProps={{ "aria-label": "Interventions" }}
            />
        );
        const master = screen.getByTestId("ints-master");
        expect(master.className).toContain("w-[420px]");
        expect(master.className).not.toContain("w-[56%]");
        expect(master.className).toContain("extra-master");
        expect(screen.getByTestId("ints-detail").className).toContain("p-4");
        expect(screen.getByRole("region", { name: "Interventions" })).toBe(master);
    });

    it("separates the panes with a border, no shadow", () => {
        render(<DesktopSplit master="m" detail="d" />);
        const master = screen.getByTestId("desktop-split-master");
        expect(master.className).toContain("border-r");
        expect(master.className).not.toMatch(/shadow/);
    });
});
