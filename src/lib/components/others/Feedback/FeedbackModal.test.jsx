import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// The fakes must behave like the real dependencies: api.post THROWS on any
// non-2xx (ky throwHttpErrors), carrying the response on the error. A fake
// that resolves { ok: false } would hide every error-path bug.
const mocks = vi.hoisted(() => ({
    post: vi.fn(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" })),
    enqueueReport: vi.fn(async () => ({})),
    setQueueApiProvider: vi.fn(),
    installOnlineFlush: vi.fn(),
    flushQueue: vi.fn(async () => {}),
    convertImageForUpload: vi.fn(async (file) => ({ file })),
}));

// Only useApi is replaced; the form components rendered by the modal use
// other hooks from the same barrel (useField, useVariantMerger, ...).
vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useApi: () => ({ post: mocks.post }),
    };
});

// The offline queue needs IndexedDB, which happy-dom does not provide.
vi.mock("./offlineQueue", () => ({
    enqueueReport: mocks.enqueueReport,
    setQueueApiProvider: mocks.setQueueApiProvider,
    installOnlineFlush: mocks.installOnlineFlush,
    flushQueue: mocks.flushQueue,
}));

// The image pipeline needs canvas/createImageBitmap, which happy-dom does
// not provide. The fake returns the file unchanged by default; tests that
// care about the reduction override it.
vi.mock("lib/upload", () => ({
    convertImageForUpload: mocks.convertImageForUpload,
}));

import { FeedbackModal } from "./FeedbackModal";

const BODY_PLACEHOLDER = "What happened? What were you trying to do?";

const renderModal = () =>
    render(<FeedbackModal isOpen onClose={() => {}} relayPath="feedback/report" appVersion="1.0.0" />);

const fillBody = (text) => {
    fireEvent.change(screen.getByPlaceholderText(BODY_PLACEHOLDER), { target: { value: text } });
};

const attachScreenshot = async (container, file) => {
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });
    // The consent checkbox only appears once the (reduced) screenshot is stored.
    await screen.findByRole("checkbox");
};

// An HTTPError-like rejection, the shape ky produces for a non-2xx answer.
const httpError = (status, apiMessage) => Object.assign(
    new Error(`Request failed with status code ${status}`),
    { name: "HTTPError", response: { status }, apiMessage }
);

describe("FeedbackModal fields", () => {
    beforeEach(() => {
        mocks.post.mockReset();
        mocks.post.mockImplementation(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" }));
        mocks.enqueueReport.mockClear();
        mocks.flushQueue.mockClear();
        mocks.convertImageForUpload.mockClear();
        mocks.convertImageForUpload.mockImplementation(async (file) => ({ file }));
    });

    it("updates the type, title and body fields and submits them to the relay", async () => {
        renderModal();

        // The form components pass the VALUE to onChange, not a DOM event
        // (SMARTMAKER.md anti-pattern 2).
        fireEvent.change(screen.getByLabelText("Type"), { target: { value: "idea" } });
        fireEvent.change(screen.getByPlaceholderText("Short summary"), { target: { value: "Add a dark theme" } });
        fillBody("It would help at night.");

        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        await waitFor(() => expect(mocks.post).toHaveBeenCalled());
        const [path, options] = mocks.post.mock.calls[0];
        expect(path).toBe("feedback/report");
        expect(options.headers["Idempotency-Key"]).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
        expect(options.body.get("type")).toBe("idea");
        expect(options.body.get("title")).toBe("Add a dark theme");
        expect(options.body.get("body")).toBe("It would help at night.");

        // Flat relay contract (Relay.php buildPayload reads these names):
        // no context[...] wrapper, and no channel (the relay config sets it).
        expect(options.body.get("app_version")).toBe("1.0.0");
        expect(options.body.get("page_url")).toBeTruthy();
        expect(options.body.get("route")).toBeTruthy();
        expect(options.body.get("occurred_at")).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        const keys = [...options.body.keys()];
        expect(keys.some(k => k.startsWith("context["))).toBe(false);
        expect(keys).not.toContain("channel");

        expect(await screen.findByText(/CSPN-1/)).toBeTruthy();
    });

    it("blocks the submit and shows an error when the body is empty", async () => {
        renderModal();
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        expect(await screen.findByText("Please describe the problem.")).toBeTruthy();
        expect(mocks.post).not.toHaveBeenCalled();
    });

    it("flushes the offline queue on mount (reports queued in a previous session)", async () => {
        renderModal();
        await waitFor(() => expect(mocks.flushQueue).toHaveBeenCalled());
    });

    it("opens PhotoEditor on the screenshot when redacting", async () => {
        const { container } = renderModal();
        await attachScreenshot(container, new File(["img"], "shot.png", { type: "image/png" }));

        fireEvent.click(screen.getByRole("button", { name: "Redact an area" }));

        // The redaction UI is PhotoEditor (redact tool only), mounted on
        // the screenshot preview. happy-dom cannot decode the blob URL, so
        // the editor shows its load error instead of the image.
        expect(document.querySelector('[data-component="PhotoEditor"]')).toBeTruthy();
        expect(await screen.findByText("Could not load the image")).toBeTruthy();
    });

    it("requires consent at the form level when a screenshot is attached", async () => {
        const { container } = renderModal();
        await attachScreenshot(container, new File(["img"], "shot.png", { type: "image/png" }));

        fillBody("See the screenshot.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        expect(await screen.findByText("Consent is required when an image is attached.")).toBeTruthy();
        expect(mocks.post).not.toHaveBeenCalled();
    });

    it("sends the screenshot reduced by prepareScreenshot", async () => {
        const original = new File(["original-bytes"], "shot.png", { type: "image/png" });
        const converted = new File(["converted"], "shot.jpg", { type: "image/jpeg" });
        mocks.convertImageForUpload.mockResolvedValueOnce({ file: converted });

        const { container } = renderModal();
        await attachScreenshot(container, original);
        fireEvent.click(screen.getByRole("checkbox"));
        fillBody("With a screenshot.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        await waitFor(() => expect(mocks.post).toHaveBeenCalled());
        const formData = mocks.post.mock.calls[0][1].body;
        expect(mocks.convertImageForUpload).toHaveBeenCalledWith(original, expect.objectContaining({
            maxSide: 1920,
            maxBytes: 5120 * 1024,
        }));
        // FormData copies the File on append: compare content, not identity.
        const sent = formData.get("screenshot");
        expect(sent).toBeInstanceOf(File);
        expect(sent.name).toBe("shot.jpg");
        expect(sent.type).toBe("image/jpeg");
        expect(await sent.text()).toBe("converted");
        expect(formData.get("screenshot_consent")).toBe("1");
    });
});

describe("FeedbackModal relay errors", () => {
    beforeEach(() => {
        mocks.post.mockReset();
        mocks.post.mockImplementation(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" }));
        mocks.enqueueReport.mockClear();
        mocks.flushQueue.mockClear();
        mocks.convertImageForUpload.mockClear();
        mocks.convertImageForUpload.mockImplementation(async (file) => ({ file }));
    });

    it("shows the relay error and does NOT queue when the relay refuses (413)", async () => {
        mocks.post.mockRejectedValueOnce(httpError(413, "Screenshot too large"));

        renderModal();
        fillBody("The image is too big.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        // The relay's message is shown as-is; the report is not queued
        // (resending the same content could only fail again).
        expect(await screen.findByText("Screenshot too large")).toBeTruthy();
        expect(mocks.enqueueReport).not.toHaveBeenCalled();
        expect(screen.queryByText("Report sent")).toBeNull();
    });

    it("shows the generic error when the relay refuses without a readable body", async () => {
        mocks.post.mockRejectedValueOnce(httpError(403));

        renderModal();
        fillBody("Not allowed.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        expect(await screen.findByText("The report could not be sent. Please try again later.")).toBeTruthy();
        expect(mocks.enqueueReport).not.toHaveBeenCalled();
    });

    it("queues the report when the network fails mid-submit", async () => {
        // No response on the error: a connection cut, not a relay refusal.
        mocks.post.mockRejectedValueOnce(new TypeError("fetch failed"));

        renderModal();
        fillBody("Offline submit.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        await waitFor(() => expect(mocks.enqueueReport).toHaveBeenCalled());
        const [payload, key] = mocks.enqueueReport.mock.calls[0];
        expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(payload.body).toBe("Offline submit.");

        // The queued row carries the context captured at submit time, so
        // the flush describes the moment of the problem. No channel: the
        // relay sets it from its own configuration, never from the PWA.
        expect(payload.context).not.toHaveProperty("channel");
        expect(payload.context.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(payload.context.page_url).toBeTruthy();

        // Deferred send: its own title plus the offline message, not the
        // success reference.
        expect(await screen.findByText("Report pending")).toBeTruthy();
        expect(await screen.findByText(/No connection/)).toBeTruthy();
        expect(screen.queryByText(/has been recorded/)).toBeNull();
    });

    it("queues the report on a transient relay refusal (503)", async () => {
        mocks.post.mockRejectedValueOnce(httpError(503));

        renderModal();
        fillBody("Server hiccup.");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        await waitFor(() => expect(mocks.enqueueReport).toHaveBeenCalled());
        expect(await screen.findByText(/No connection/)).toBeTruthy();
    });
});

describe("FeedbackModal redaction keyboard", () => {
    beforeEach(() => {
        mocks.post.mockReset();
        mocks.post.mockImplementation(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" }));
        mocks.enqueueReport.mockClear();
        mocks.flushQueue.mockClear();
        mocks.convertImageForUpload.mockClear();
        mocks.convertImageForUpload.mockImplementation(async (file) => ({ file }));
    });

    // Open the redaction editor on an attached screenshot and activate
    // the redact tool, so the keyboard overlay is in the DOM.
    const openRedaction = async (onClose) => {
        const { container } = render(
            <FeedbackModal isOpen onClose={onClose} relayPath="feedback/report" appVersion="1.0.0" />
        );
        await attachScreenshot(container, new File(["img"], "shot.png", { type: "image/png" }));
        fireEvent.click(screen.getByRole("button", { name: "Redact an area" }));
        fireEvent.click(screen.getByLabelText("Redact"));
        const overlay = document.querySelector('[data-component="PhotoEditorRedactOverlay"]');
        expect(overlay).toBeTruthy();
        return overlay;
    };

    it("keeps the form and the typed text when Escape cancels a rectangle being drawn", async () => {
        const onClose = vi.fn();
        const overlay = await openRedaction(onClose);
        fillBody("My precious description.");

        // Enter starts a rectangle, Escape cancels it. The overlay marks
        // the event prevented; Modal must not close the form over it.
        fireEvent.keyDown(overlay, { key: "Enter" });
        fireEvent.keyDown(overlay, { key: "Escape" });

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByPlaceholderText(BODY_PLACEHOLDER).value).toBe("My precious description.");
    });

    it("keeps the form when Escape is pressed in the redaction editor without a draft", async () => {
        const onClose = vi.fn();
        const overlay = await openRedaction(onClose);
        fillBody("Still typing.");

        // No draft: the overlay does not prevent the event, the editor
        // being open is what keeps every close path inert.
        fireEvent.keyDown(overlay, { key: "Escape" });

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByPlaceholderText(BODY_PLACEHOLDER).value).toBe("Still typing.");
    });
});
