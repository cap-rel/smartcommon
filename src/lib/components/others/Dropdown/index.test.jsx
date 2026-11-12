import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Dropdown } from "./index";
import { Modal } from "lib/components/others/Modal";

const buildItems = (overrides = {}) => [
    { key: "edit", label: "Edit", onClick: overrides.onEdit ?? vi.fn(), testId: "item-edit" },
    { key: "archive", label: "Archive", disabled: true },
    { divider: true },
    { key: "delete", label: "Delete", danger: true, onClick: overrides.onDelete ?? vi.fn() },
];

const renderDropdown = (props = {}) => render(
    <>
        <button type="button">outside</button>
        <Dropdown
            trigger={<button type="button">Actions</button>}
            items={buildItems(props)}
            {...props}
        />
    </>
);

describe("Dropdown - menu button", () => {
    it("announces a closed menu on its trigger", () => {
        renderDropdown();
        const trigger = screen.getByRole("button", { name: "Actions" });
        expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("opens a menu named by its trigger and focuses the first item", () => {
        renderDropdown();
        const trigger = screen.getByRole("button", { name: "Actions" });
        fireEvent.click(trigger);

        const menu = screen.getByRole("menu", { name: "Actions" });
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
        expect(screen.getAllByRole("menuitem")).toHaveLength(3);
        expect(screen.getByRole("separator")).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }));
    });

    it("opens from the keyboard with ArrowDown and ArrowUp", () => {
        renderDropdown();
        const trigger = screen.getByRole("button", { name: "Actions" });
        fireEvent.keyDown(trigger, { key: "ArrowUp" });
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Delete" }));
    });
});

describe("Dropdown - keyboard inside the menu", () => {
    it("moves with the arrows, skips disabled items and wraps", () => {
        renderDropdown();
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        const menu = screen.getByRole("menu");
        const edit = screen.getByRole("menuitem", { name: "Edit" });
        const del = screen.getByRole("menuitem", { name: "Delete" });

        fireEvent.keyDown(menu, { key: "ArrowDown" });
        expect(document.activeElement).toBe(del);
        fireEvent.keyDown(menu, { key: "ArrowDown" });
        expect(document.activeElement).toBe(edit);
        fireEvent.keyDown(menu, { key: "ArrowUp" });
        expect(document.activeElement).toBe(del);
        fireEvent.keyDown(menu, { key: "Home" });
        expect(document.activeElement).toBe(edit);
        fireEvent.keyDown(menu, { key: "End" });
        expect(document.activeElement).toBe(del);
    });

    it("closes on Escape and gives the focus back to the trigger", () => {
        renderDropdown();
        const trigger = screen.getByRole("button", { name: "Actions" });
        fireEvent.click(trigger);
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        expect(screen.queryByRole("menu")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it("closes on Tab", () => {
        renderDropdown();
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("closes only itself when Escape is pressed inside a Modal", () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="Invoice">
                <Dropdown trigger={<button type="button">Actions</button>} items={buildItems()} />
            </Modal>
        );
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        expect(screen.queryByRole("menu")).toBeNull();
        expect(onClose).not.toHaveBeenCalled();
    });
});

describe("Dropdown - selection and closing", () => {
    it("runs an item and closes", () => {
        const onEdit = vi.fn();
        renderDropdown({ onEdit });
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        fireEvent.click(screen.getByTestId("item-edit"));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("ignores a disabled item", () => {
        renderDropdown();
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        const archive = screen.getByRole("menuitem", { name: "Archive" });
        expect(archive.disabled).toBe(true);
        fireEvent.click(archive);
        expect(screen.getByRole("menu")).toBeTruthy();
    });

    it("closes on a click outside", () => {
        renderDropdown();
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("keeps the documented testId and menuClassName", () => {
        renderDropdown({ testId: "row-menu", menuClassName: "w-64" });
        fireEvent.click(screen.getByRole("button", { name: "Actions" }));
        expect(screen.getByTestId("row-menu-menu").className).toContain("w-64");
    });

    it("hands the toggle and the ARIA attributes to a render-function trigger", () => {
        render(
            <Dropdown
                items={buildItems()}
                trigger={({ toggle, triggerProps }) => (
                    <button type="button" { ...triggerProps } onClick={toggle}>More</button>
                )}
            />
        );
        const trigger = screen.getByRole("button", { name: "More" });
        fireEvent.click(trigger);
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("menu", { name: "More" })).toBeTruthy();
    });
});
