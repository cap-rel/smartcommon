/**
 * The type picker and the annotation editor are modal dialogs.
 *
 * The picker carried role="dialog" with no name, no aria-modal and no
 * Escape; the editor listened to Escape on the whole document, so an Escape
 * already handled inside it (a list, a confirmation) closed it as well.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { TypePicker } from "./TypePicker";
import { EditorWrapper } from "./EditorWrapper";

const labels = { chooseType: "Type de repère", pickerCancel: "Annuler" };
const annotationTypes = { leak: { label: "Fuite", color: "#2563eb", icon: "F" } };

describe("PhotoAnnotator TypePicker", () => {
    it("is a modal dialog named by its heading", () => {
        render(<TypePicker annotationTypes={annotationTypes} labels={labels} onPick={() => {}} onCancel={() => {}} />);
        const dialog = screen.getByRole("dialog", { name: "Type de repère" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("cancels on Escape", () => {
        const onCancel = vi.fn();
        render(<TypePicker annotationTypes={annotationTypes} labels={labels} onPick={() => {}} onCancel={onCancel} />);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});

describe("PhotoAnnotator EditorWrapper", () => {
    const typeDef = {
        label: "Fuite",
        renderEditor: (annotation, { onCancel }) => (
            <div>
                <button type="button" onClick={onCancel}>Fermer</button>
                <input
                    aria-label="Note"
                    onKeyDown={(e) => {
                        // A field that uses Escape itself (clears a suggestion list)
                        if (e.key === "Escape") e.preventDefault();
                    }}
                />
            </div>
        ),
    };

    it("is a modal dialog named by the annotation type", () => {
        render(<EditorWrapper annotation={{ id: 1 }} typeDef={typeDef} onSave={() => {}} onCancel={() => {}} />);
        const dialog = screen.getByRole("dialog", { name: "Fuite" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("cancels on Escape", () => {
        const onCancel = vi.fn();
        render(<EditorWrapper annotation={{ id: 1 }} typeDef={typeDef} onSave={() => {}} onCancel={onCancel} />);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("leaves an Escape already handled inside the editor alone", () => {
        const onCancel = vi.fn();
        render(<EditorWrapper annotation={{ id: 1 }} typeDef={typeDef} onSave={() => {}} onCancel={onCancel} />);
        fireEvent.keyDown(screen.getByLabelText("Note"), { key: "Escape" });
        expect(onCancel).not.toHaveBeenCalled();
    });
});
