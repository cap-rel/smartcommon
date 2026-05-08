import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";

beforeEach(() => {
    if (typeof globalThis.ResizeObserver === "undefined") {
        globalThis.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    }
    // happy-dom doesn't ship window.confirm; default to "OK" so delete tests
    // that don't override it still produce a deletion. Tests that need a
    // dismissal override this explicitly.
    window.confirm = vi.fn().mockReturnValue(true);
});

import { PhotoAnnotator } from "./index";

// Wrapper that mirrors a real consumer: it owns the annotations state and
// updates it from onChange so the component re-renders with fresh props
// between user interactions (otherwise list-mutation tests assert against a
// stale `annotations` array).
const StatefulPhotoAnnotator = ({ initialAnnotations = [], onChange, ...rest }) => {
    const [items, setItems] = useState(initialAnnotations);
    const handleChange = (next) => {
        setItems(next);
        onChange?.(next);
    };
    return <PhotoAnnotator annotations={items} onChange={handleChange} {...rest} />;
};

const NoteIcon = () => <span data-testid="note-icon">N</span>;
const ProductIcon = () => <span data-testid="product-icon">P</span>;

const noteType = {
    label: "Note",
    icon: <NoteIcon />,
    color: "#F59E0B",
    newPayload: () => ({ description: "" }),
    renderMarker: (a, { num }) => (
        <span data-testid={`marker-${a.id}`}>{num}</span>
    ),
    renderEditor: (a, { onSave, onCancel }) => (
        <div data-testid="note-editor">
            <button type="button" onClick={() => onSave({ payload: { description: "hello" } })}>
                save-note
            </button>
            <button type="button" onClick={onCancel}>cancel-note</button>
        </div>
    ),
};

const productType = {
    label: "Produit",
    icon: <ProductIcon />,
    color: "#3B82F6",
    renderMarker: (a, { num }) => (
        <span data-testid={`marker-${a.id}`}>{num}</span>
    ),
    renderEditor: (a, { onSave }) => (
        <div data-testid="product-editor">
            <button
                type="button"
                onClick={() => onSave({ payload: { fk_product: 42 } })}
            >
                save-product
            </button>
        </div>
    ),
};

const renderAnnotator = (overrides = {}) => {
    const { annotations: initial, ...rest } = overrides;
    const onChange = vi.fn();
    const utils = render(
        <StatefulPhotoAnnotator
            src="https://example.com/photo.jpg"
            initialAnnotations={initial}
            onChange={onChange}
            annotationTypes={{ note: noteType }}
            {...rest}
        />
    );
    return { ...utils, onChange };
};

describe("PhotoAnnotator - rendering", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("renders the image", () => {
        renderAnnotator();
        const img = document.querySelector("img");
        expect(img).not.toBeNull();
        expect(img.src).toBe("https://example.com/photo.jpg");
    });

    it("renders existing annotations as markers", () => {
        renderAnnotator({
            annotations: [
                { id: "a", type: "note", x: 10, y: 20, payload: { description: "x" } },
                { id: "b", type: "note", x: 30, y: 40, payload: { description: "y" } },
            ],
        });
        expect(screen.getByTestId("marker-a")).toBeDefined();
        expect(screen.getByTestId("marker-b")).toBeDefined();
    });

    it("shows the empty list message when no annotations", () => {
        renderAnnotator();
        expect(screen.getByText(/Aucune annotation/i)).toBeDefined();
    });

    it("hides the list entirely when listPosition='off'", () => {
        renderAnnotator({ listPosition: "off" });
        expect(screen.queryByText(/Aucune annotation/i)).toBeNull();
    });

    it("does not render the add button in readOnly", () => {
        renderAnnotator({ readOnly: true });
        expect(screen.queryByLabelText(/Ajouter une annotation/i)).toBeNull();
    });
});

describe("PhotoAnnotator - creation via add button", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("with one type: creates an annotation at center, opens editor, saves on onSave", () => {
        const { onChange } = renderAnnotator();
        fireEvent.click(screen.getByLabelText(/Ajouter une annotation/i));

        // Editor opens immediately.
        expect(screen.getByTestId("note-editor")).toBeDefined();

        // The annotation was added at center (50, 50).
        expect(onChange).toHaveBeenCalledTimes(1);
        const after = onChange.mock.calls[0][0];
        expect(after).toHaveLength(1);
        expect(after[0].type).toBe("note");
        expect(after[0].x).toBe(50);
        expect(after[0].y).toBe(50);
        expect(after[0].payload).toEqual({ description: "" });

        // Saving the editor merges the payload.
        fireEvent.click(screen.getByText("save-note"));
        expect(onChange).toHaveBeenCalledTimes(2);
        const final = onChange.mock.calls[1][0];
        expect(final).toHaveLength(1);
        expect(final[0].payload).toEqual({ description: "hello" });
    });

    it("with two types: clicking + opens the type picker", () => {
        renderAnnotator({
            annotationTypes: { note: noteType, product: productType },
        });

        fireEvent.click(screen.getByLabelText(/Ajouter une annotation/i));

        expect(screen.getByText(/Type d'annotation/i)).toBeDefined();
        expect(screen.getByText("Note")).toBeDefined();
        expect(screen.getByText("Produit")).toBeDefined();
    });

    it("picking a type from the picker opens the matching editor", () => {
        const { onChange } = renderAnnotator({
            annotationTypes: { note: noteType, product: productType },
        });
        fireEvent.click(screen.getByLabelText(/Ajouter une annotation/i));

        fireEvent.click(screen.getByText("Produit"));
        expect(screen.getByTestId("product-editor")).toBeDefined();

        fireEvent.click(screen.getByText("save-product"));
        const final = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(final[0].type).toBe("product");
        expect(final[0].payload).toEqual({ fk_product: 42 });
    });

    it("cancelling the editor does not append the annotation", () => {
        const { onChange } = renderAnnotator({
            annotationTypes: { note: noteType, product: productType },
        });
        fireEvent.click(screen.getByLabelText(/Ajouter une annotation/i));
        fireEvent.click(screen.getByText("Note"));
        // Editor open, no onChange yet (this is a 2-types flow: persist on save).
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText("cancel-note"));
        expect(screen.queryByTestId("note-editor")).toBeNull();
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("PhotoAnnotator - list interactions", () => {
    afterEach(() => { vi.clearAllMocks(); });

    const seeded = [
        { id: "a", type: "note", x: 10, y: 20, payload: { description: "x" } },
        { id: "b", type: "note", x: 30, y: 40, payload: { description: "y" } },
    ];

    it("calls onAnnotationSelect when a list item is clicked", () => {
        const onAnnotationSelect = vi.fn();
        renderAnnotator({ annotations: seeded, onAnnotationSelect });

        // List items render Note label twice (once per annotation); we click
        // the first one explicitly via the surrounding button.
        const buttons = screen.getAllByRole("button", { name: /Note/i });
        fireEvent.click(buttons[0]);

        expect(onAnnotationSelect).toHaveBeenCalledWith(seeded[0]);
    });

    it("opens the editor in edit mode when the pen button is clicked", () => {
        const { onChange } = renderAnnotator({ annotations: seeded });
        const editButtons = screen.getAllByLabelText(/Modifier/i);
        fireEvent.click(editButtons[0]);
        expect(screen.getByTestId("note-editor")).toBeDefined();

        fireEvent.click(screen.getByText("save-note"));
        // Edit replaces the existing entry, doesn't grow the list.
        const final = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(final).toHaveLength(2);
        expect(final[0].id).toBe("a");
        expect(final[0].payload).toEqual({ description: "hello" });
    });

    it("deletes an annotation when the trash button is confirmed", () => {
        // beforeEach sets window.confirm to return true.
        const { onChange } = renderAnnotator({ annotations: seeded });
        const trashButtons = screen.getAllByLabelText(/Supprimer/i);
        fireEvent.click(trashButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
        const final = onChange.mock.calls[0][0];
        expect(final).toHaveLength(1);
        expect(final[0].id).toBe("b");
    });

    it("does not delete when window.confirm is dismissed", () => {
        window.confirm = vi.fn().mockReturnValue(false);
        const { onChange } = renderAnnotator({ annotations: seeded });
        fireEvent.click(screen.getAllByLabelText(/Supprimer/i)[0]);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("hides edit/delete buttons in readOnly", () => {
        renderAnnotator({ annotations: seeded, readOnly: true });
        expect(screen.queryByLabelText(/Modifier/i)).toBeNull();
        expect(screen.queryByLabelText(/Supprimer/i)).toBeNull();
    });
});

describe("PhotoAnnotator - background long press", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("opens the type picker after the configured delay (when 2+ types)", () => {
        renderAnnotator({
            annotationTypes: { note: noteType, product: productType },
            longPressMs: 100,
        });

        const img = document.querySelector("img");
        fireEvent.pointerDown(img, {
            clientX: 100,
            clientY: 100,
            pointerType: "mouse",
            button: 0,
        });

        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(screen.getByText(/Type d'annotation/i)).toBeDefined();
    });
});

describe("PhotoAnnotator - labels override", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("uses custom labels when provided", () => {
        renderAnnotator({
            labels: {
                addAnnotation: "Add marker",
                listEmpty: "Nothing here",
            },
        });
        expect(screen.getByLabelText("Add marker")).toBeDefined();
        expect(screen.getByText("Nothing here")).toBeDefined();
    });
});
