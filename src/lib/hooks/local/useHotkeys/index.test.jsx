import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";

import { useHotkeys } from "./index";

const Harness = ({ map, enabled }) => {
    useHotkeys(map, { enabled });
    return (
        <>
            <input aria-label="search" />
            <div contentEditable suppressContentEditableWarning data-testid="editor" />
        </>
    );
};

describe("useHotkeys", () => {
    it("calls the handler of a single key and prevents the default", () => {
        const onSlash = vi.fn();
        render(<Harness map={{ "/": onSlash }} />);
        const event = new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        expect(onSlash).toHaveBeenCalledTimes(1);
        expect(event.defaultPrevented).toBe(true);
    });

    it("maps Ctrl and Cmd to mod, then alt and shift", () => {
        const onSave = vi.fn();
        const onPalette = vi.fn();
        render(<Harness map={{ "mod+k": onPalette, "mod+shift+s": onSave }} />);
        fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
        fireEvent.keyDown(document.body, { key: "k", metaKey: true });
        fireEvent.keyDown(document.body, { key: "S", ctrlKey: true, shiftKey: true });
        expect(onPalette).toHaveBeenCalledTimes(2);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("ignores a bare key while typing, not a modifier combo nor Escape", () => {
        const onSlash = vi.fn();
        const onPalette = vi.fn();
        const onEscape = vi.fn();
        render(<Harness map={{ "/": onSlash, "mod+k": onPalette, escape: onEscape }} />);
        const field = screen.getByLabelText("search");

        fireEvent.keyDown(field, { key: "/" });
        fireEvent.keyDown(screen.getByTestId("editor"), { key: "/" });
        fireEvent.keyDown(field, { key: "k", ctrlKey: true });
        fireEvent.keyDown(field, { key: "Escape" });

        expect(onSlash).not.toHaveBeenCalled();
        expect(onPalette).toHaveBeenCalledTimes(1);
        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it("ignores an event already handled", () => {
        const onEscape = vi.fn();
        render(<Harness map={{ escape: onEscape }} />);
        const preventer = (e) => e.preventDefault();
        document.addEventListener("keydown", preventer, true);
        try {
            fireEvent.keyDown(document.body, { key: "Escape" });
        } finally {
            document.removeEventListener("keydown", preventer, true);
        }
        expect(onEscape).not.toHaveBeenCalled();
    });

    it("detaches when disabled", () => {
        const onSlash = vi.fn();
        render(<Harness map={{ "/": onSlash }} enabled={false} />);
        fireEvent.keyDown(document.body, { key: "/" });
        expect(onSlash).not.toHaveBeenCalled();
    });

    it("uses the latest map without needing a memoized object", () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(({ map }) => useHotkeys(map), { initialProps: { map: { j: first } } });
        rerender({ map: { j: second } });
        fireEvent.keyDown(document.body, { key: "j" });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("names the space bar space", () => {
        const onSpace = vi.fn();
        render(<Harness map={{ space: onSpace }} />);
        fireEvent.keyDown(document.body, { key: " " });
        expect(onSpace).toHaveBeenCalledTimes(1);
    });
});
