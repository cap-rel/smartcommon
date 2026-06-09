import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// The engine touches canvas/createImageBitmap which happy-dom does not provide.
// Mock it so we can exercise the component's wiring (tool state -> operations).
const DETECTED_CORNERS = [
    { x: 0.1, y: 0.05 },
    { x: 0.9, y: 0.04 },
    { x: 0.95, y: 0.96 },
    { x: 0.05, y: 0.94 },
];

vi.mock("lib/imageEditor", () => ({
    loadBitmap: vi.fn(async () => ({ width: 800, height: 600 })),
    bitmapToCanvas: vi.fn(() => ({ width: 800, height: 600 })),
    fitCanvas: vi.fn((canvas) => canvas),
    applyPipeline: vi.fn(() => ({
        width: 800,
        height: 600,
        getContext: () => ({
            getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
        }),
    })),
    applyImageEdits: vi.fn(async () => new Blob(["x"], { type: "image/jpeg" })),
    detectDocumentQuad: vi.fn(() => DETECTED_CORNERS),
}));

import { PhotoEditor } from "./";
import { loadBitmap, applyImageEdits, detectDocumentQuad } from "lib/imageEditor";

const ready = () => waitFor(() => expect(loadBitmap).toHaveBeenCalled());

describe("PhotoEditor", () => {
    beforeEach(() => vi.clearAllMocks());

    it("renders nothing when closed", () => {
        const { container } = render(<PhotoEditor open={false} src="blob:x" />);
        expect(container.firstChild).toBeNull();
    });

    it("renders the geometry toolbar", async () => {
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        expect(screen.getByLabelText("Rotate right")).toBeTruthy();
        expect(screen.getByLabelText("Rotate left")).toBeTruthy();
        expect(screen.getByLabelText("Flip horizontal")).toBeTruthy();
        expect(screen.getByLabelText("Flip vertical")).toBeTruthy();
        expect(screen.getByLabelText("Crop")).toBeTruthy();
        expect(screen.getByLabelText("Straighten")).toBeTruthy();
    });

    it("honours the tools prop to hide tools", async () => {
        render(<PhotoEditor open src="blob:x" tools={["rotate"]} />);
        await ready();
        expect(screen.getByLabelText("Rotate right")).toBeTruthy();
        expect(screen.queryByLabelText("Crop")).toBeNull();
        expect(screen.queryByLabelText("Flip horizontal")).toBeNull();
    });

    it("exports a rotate operation on save and passes the recipe to onSave", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();

        fireEvent.click(screen.getByLabelText("Rotate right"));
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        const ops = applyImageEdits.mock.calls[0][1];
        expect(ops).toContainEqual({ type: "rotate90", steps: 1 });

        await waitFor(() => expect(onSave).toHaveBeenCalled());
        const [blob, meta] = onSave.mock.calls[0];
        expect(blob).toBeInstanceOf(Blob);
        expect(meta).toEqual({ operations: ops });
    });

    it("toggles flip horizontal and reflects it via aria-pressed", async () => {
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        const flip = screen.getByLabelText("Flip horizontal");
        expect(flip.getAttribute("aria-pressed")).toBeNull();
        fireEvent.click(flip);
        expect(flip.getAttribute("aria-pressed")).toBe("true");
    });

    it("resets all operations", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();

        fireEvent.click(screen.getByLabelText("Rotate right"));
        fireEvent.click(screen.getByText("Reset"));
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        expect(applyImageEdits.mock.calls[0][1]).toEqual([]);
    });

    it("calls onCancel", async () => {
        const onCancel = vi.fn();
        render(<PhotoEditor open src="blob:x" onCancel={onCancel} />);
        await ready();
        fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);
        expect(onCancel).toHaveBeenCalled();
    });

    it("shows the crop ratio chips when the crop tool is active", async () => {
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        fireEvent.click(screen.getByLabelText("Crop"));
        expect(screen.getByText("1:1")).toBeTruthy();
        expect(screen.getByText("16:9")).toBeTruthy();
    });

    it("shows four draggable corners when the perspective tool is active", async () => {
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        fireEvent.click(screen.getByLabelText("Perspective"));
        ["nw", "ne", "se", "sw"].forEach((corner) => {
            expect(screen.getByLabelText(`perspective-corner-${corner}`)).toBeTruthy();
        });
    });

    it("emits no perspective op when the quad is left at the default corners", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();
        fireEvent.click(screen.getByLabelText("Perspective")); // activate, default quad
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);
        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        expect(applyImageEdits.mock.calls[0][1]).toEqual([]);
    });

    it("shows the light/color sliders when the adjust tool is active", async () => {
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        fireEvent.click(screen.getByLabelText("Adjust"));
        expect(screen.getByLabelText("Brightness")).toBeTruthy();
        expect(screen.getByLabelText("Contrast")).toBeTruthy();
        expect(screen.getByLabelText("Saturation")).toBeTruthy();
        expect(screen.getByLabelText("Temperature")).toBeTruthy();
    });

    it("exports an adjust op after moving a slider", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();
        fireEvent.click(screen.getByLabelText("Adjust"));
        fireEvent.change(screen.getByLabelText("Brightness"), { target: { value: "30" } });
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        const ops = applyImageEdits.mock.calls[0][1];
        expect(ops).toContainEqual({
            type: "adjust",
            brightness: 0.3,
            contrast: 0,
            saturation: 0,
            temperature: 0,
        });
    });

    it("exports a binarized scan op when the scan preset is selected", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();
        fireEvent.click(screen.getByLabelText("Adjust"));
        fireEvent.click(screen.getByLabelText("Scan"));
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        expect(applyImageEdits.mock.calls[0][1]).toContainEqual({ type: "scan", binarize: true });
    });

    it("auto-detect prefills the perspective quad and exports a perspective op", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();
        fireEvent.click(screen.getByLabelText("Perspective"));
        fireEvent.click(screen.getByLabelText("Detect edges"));
        expect(detectDocumentQuad).toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);
        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        expect(applyImageEdits.mock.calls[0][1]).toContainEqual({
            type: "perspective",
            corners: DETECTED_CORNERS,
        });
    });

    it("shows a notice when no document is detected", async () => {
        detectDocumentQuad.mockReturnValueOnce(null);
        render(<PhotoEditor open src="blob:x" />);
        await ready();
        fireEvent.click(screen.getByLabelText("Perspective"));
        fireEvent.click(screen.getByLabelText("Detect edges"));
        expect(screen.getByText("No document detected")).toBeTruthy();
        expect(screen.getByRole("status")).toBeTruthy();
    });

    it("color presets are mutually exclusive (B&W then Scan keeps only Scan)", async () => {
        const onSave = vi.fn();
        render(<PhotoEditor open src="blob:x" onSave={onSave} />);
        await ready();
        fireEvent.click(screen.getByLabelText("Adjust"));
        fireEvent.click(screen.getByLabelText("B&W"));
        fireEvent.click(screen.getByLabelText("Scan"));
        fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);

        await waitFor(() => expect(applyImageEdits).toHaveBeenCalled());
        const scanOps = applyImageEdits.mock.calls[0][1].filter((o) => o.type === "scan");
        expect(scanOps).toEqual([{ type: "scan", binarize: true }]);
    });
});
