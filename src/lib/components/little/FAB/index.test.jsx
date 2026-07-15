import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { FAB } from "./";

const Icon = () => <i data-testid="glyph" />;

describe("FAB - simple mode (no actions)", () => {
    it("fires onClick when the main button is pressed", () => {
        const onClick = vi.fn();
        render(<FAB icon={Icon} onClick={onClick} label="Add" />);

        fireEvent.click(screen.getByRole("button", { name: "Add" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not expose aria-expanded without actions", () => {
        render(<FAB icon={Icon} label="Add" />);
        expect(screen.getByRole("button", { name: "Add" }).getAttribute("aria-expanded")).toBeNull();
    });
});

describe("FAB - speed-dial (uncontrolled)", () => {
    it("toggles open on main click and renders the actions", () => {
        render(
            <FAB
                icon={Icon}
                label="Menu"
                actions={[
                    { icon: Icon, label: "Edit", onClick: vi.fn() },
                    { icon: Icon, label: "Delete", onClick: vi.fn() },
                ]}
            />
        );

        const main = screen.getByRole("button", { name: "Menu" });
        expect(main.getAttribute("aria-expanded")).toBe("false");
        // Action buttons are always mounted (visibility is CSS-toggled).
        expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();

        fireEvent.click(main);
        expect(main.getAttribute("aria-expanded")).toBe("true");
    });

    it("calls the action handler and closes the menu", () => {
        const onEdit = vi.fn();
        render(
            <FAB
                icon={Icon}
                label="Menu"
                actions={[{ icon: Icon, label: "Edit", onClick: onEdit }]}
            />
        );

        const main = screen.getByRole("button", { name: "Menu" });
        fireEvent.click(main);
        expect(main.getAttribute("aria-expanded")).toBe("true");

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(main.getAttribute("aria-expanded")).toBe("false");
    });

    it("does not call onClick when actions are provided", () => {
        const onClick = vi.fn();
        render(
            <FAB
                icon={Icon}
                label="Menu"
                onClick={onClick}
                actions={[{ icon: Icon, label: "Edit", onClick: vi.fn() }]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Menu" }));
        expect(onClick).not.toHaveBeenCalled();
    });
});

describe("FAB - speed-dial (controlled)", () => {
    it("reflects isOpen and reports changes via onOpenChange", () => {
        const onOpenChange = vi.fn();
        render(
            <FAB
                icon={Icon}
                label="Menu"
                isOpen
                onOpenChange={onOpenChange}
                actions={[{ icon: Icon, label: "Edit", onClick: vi.fn() }]}
            />
        );

        const main = screen.getByRole("button", { name: "Menu" });
        expect(main.getAttribute("aria-expanded")).toBe("true");

        fireEvent.click(main);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
