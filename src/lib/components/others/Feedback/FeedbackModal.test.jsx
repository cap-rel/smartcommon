import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Only useApi is replaced; the form components rendered by the modal use
// other hooks from the same barrel (useField, useVariantMerger, ...).
const mocks = vi.hoisted(() => ({
    post: vi.fn(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" })),
}));

vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useApi: () => ({ post: mocks.post }),
    };
});

// The offline queue needs IndexedDB, which happy-dom does not provide.
vi.mock("./offlineQueue", () => ({
    enqueueReport: vi.fn(async () => ({})),
    setQueueApiProvider: vi.fn(),
    installOnlineFlush: vi.fn(),
    flushQueue: vi.fn(async () => {}),
}));

import { FeedbackModal } from "./FeedbackModal";

const BODY_PLACEHOLDER = "What happened? What were you trying to do?";

const renderModal = () =>
    render(<FeedbackModal isOpen onClose={() => {}} relayPath="feedback/report" appVersion="1.0.0" />);

describe("FeedbackModal fields", () => {
    beforeEach(() => {
        mocks.post.mockClear();
    });

    it("updates the type, title and body fields and submits them to the relay", async () => {
        renderModal();

        // The form components pass the VALUE to onChange, not a DOM event
        // (SMARTMAKER.md anti-pattern 2).
        fireEvent.change(screen.getByLabelText("Type"), { target: { value: "idea" } });
        fireEvent.change(screen.getByPlaceholderText("Short summary"), { target: { value: "Add a dark theme" } });
        fireEvent.change(screen.getByPlaceholderText(BODY_PLACEHOLDER), { target: { value: "It would help at night." } });

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

        expect(await screen.findByText(/CSPN-1/)).toBeTruthy();
    });

    it("blocks the submit and shows an error when the body is empty", async () => {
        renderModal();
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        expect(await screen.findByText("Please describe the problem.")).toBeTruthy();
        expect(mocks.post).not.toHaveBeenCalled();
    });
});
