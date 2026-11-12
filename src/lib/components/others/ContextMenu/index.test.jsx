import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";

import { ContextMenu } from "./index";
import { useContextMenu } from "lib/hooks/local/useContextMenu";
import { fr } from "lib/locales/fr";

const Rows = ({ onOpen = vi.fn(), onDelete = vi.fn(), labels }) => {
    const ctx = useContextMenu();
    const items = [
        { label: "Open", onClick: onOpen },
        { label: "Rename", disabled: true },
        { divider: true },
        { label: "Delete", danger: true, onClick: onDelete },
    ];
    return (
        <>
            <div tabIndex={0} data-testid="row" onContextMenu={(e) => ctx.open(e, items)}>Invoice 42</div>
            <button type="button">elsewhere</button>
            <ContextMenu state={ctx} labels={labels} />
        </>
    );
};

describe("useContextMenu", () => {
    it("opens at the pointer, cancels the browser menu and keeps the items", () => {
        const { result } = renderHook(() => useContextMenu());
        const event = { clientX: 120, clientY: 80, preventDefault: vi.fn(), stopPropagation: vi.fn() };
        const items = [{ label: "Open" }];

        act(() => result.current.open(event, items));

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result.current).toMatchObject({ isOpen: true, x: 120, y: 80, items });
        expect(typeof result.current.open).toBe("function");

        act(() => result.current.close());
        expect(result.current.isOpen).toBe(false);
    });

    it("keeps the menu inside the window", () => {
        const { result } = renderHook(() => useContextMenu());
        act(() => result.current.open(
            { clientX: window.innerWidth - 5, clientY: window.innerHeight - 5, preventDefault() {}, stopPropagation() {} },
            [{ label: "A" }, { label: "B" }],
        ));
        expect(result.current.x).toBe(window.innerWidth - 220);
        expect(result.current.y).toBe(window.innerHeight - 8 - 80);
    });

    it("opens under the target when triggered from the keyboard", () => {
        const { result } = renderHook(() => useContextMenu());
        const target = { getBoundingClientRect: () => ({ left: 40, bottom: 60 }) };
        act(() => result.current.open({ clientX: 0, clientY: 0, currentTarget: target, preventDefault() {}, stopPropagation() {} }, []));
        expect(result.current).toMatchObject({ x: 40, y: 60 });
    });
});

describe("ContextMenu", () => {
    it("renders nothing until opened", () => {
        render(<Rows />);
        expect(screen.queryByRole("menu")).toBeNull();
        expect(screen.queryByTestId("context-menu")).toBeNull();
    });

    it("opens a named menu at the pointer, focused on its first entry", () => {
        render(<Rows />);
        fireEvent.contextMenu(screen.getByTestId("row"), { clientX: 30, clientY: 40 });

        const menu = screen.getByRole("menu", { name: "Actions" });
        expect(menu.style.top).toBe("40px");
        expect(menu.style.left).toBe("30px");
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Open" }));
    });

    it("translates its name through the locale bundle", () => {
        render(<Rows labels={fr.ContextMenu} />);
        fireEvent.contextMenu(screen.getByTestId("row"), { clientX: 30, clientY: 40 });
        expect(screen.getByRole("menu", { name: fr.ContextMenu.menu })).toBeTruthy();
    });

    it("moves with the arrows past disabled entries", () => {
        render(<Rows />);
        fireEvent.contextMenu(screen.getByTestId("row"), { clientX: 30, clientY: 40 });
        fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Delete" }));
    });

    it("closes on Escape and gives the focus back to the row", () => {
        render(<Rows />);
        const row = screen.getByTestId("row");
        row.focus();
        fireEvent.contextMenu(row, { clientX: 30, clientY: 40 });
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        expect(screen.queryByRole("menu")).toBeNull();
        expect(document.activeElement).toBe(row);
    });

    it("runs a picked entry and closes", () => {
        const onDelete = vi.fn();
        render(<Rows onDelete={onDelete} />);
        fireEvent.contextMenu(screen.getByTestId("row"), { clientX: 30, clientY: 40 });
        fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("closes on a click outside", () => {
        render(<Rows />);
        fireEvent.contextMenu(screen.getByTestId("row"), { clientX: 30, clientY: 40 });
        fireEvent.mouseDown(screen.getByRole("button", { name: "elsewhere" }));
        expect(screen.queryByRole("menu")).toBeNull();
    });
});
