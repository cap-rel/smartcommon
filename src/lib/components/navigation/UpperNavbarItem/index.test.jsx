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
