import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { Modal } from "./index";

describe("Modal", () => {
    it("closes on Escape", () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="Test">
                <div>content</div>
            </Modal>
        );

        fireEvent.keyDown(document.body, { key: "Escape" });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignores an Escape already handled by an inner component", () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="Test">
                <div>content</div>
            </Modal>
        );

        // An inner tool (e.g. a photo editor overlay) handles Escape
        // itself and marks it prevented. Capture phase: runs before
        // Modal's bubble listener on document.
        const preventer = (e) => {
            if (e.key === "Escape") e.preventDefault();
        };
        document.addEventListener("keydown", preventer, true);
        try {
            fireEvent.keyDown(document.body, { key: "Escape" });
        } finally {
            document.removeEventListener("keydown", preventer, true);
        }

        expect(onClose).not.toHaveBeenCalled();
    });
});
