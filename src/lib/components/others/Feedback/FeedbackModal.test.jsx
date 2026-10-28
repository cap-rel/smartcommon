import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

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

// Fake SpeechRecognition: records its lifecycle and lets the test fire
// events by hand.
class FakeRecognition {
    constructor() {
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
        this.stopped = false;
        FakeRecognition.instances.push(this);
    }

    start() {}

    stop() {
        this.stopped = true;
        this.onend?.();
    }
}
FakeRecognition.instances = [];

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

describe("FeedbackModal dictation", () => {
    beforeEach(() => {
        FakeRecognition.instances = [];
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
    });

    afterEach(() => {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
    });

    it("hides the dictation button when SpeechRecognition is unavailable", () => {
        renderModal();
        expect(screen.queryByLabelText("Dictate")).toBeNull();
    });

    it("appends the transcript to the description and toggles back on stop", () => {
        window.SpeechRecognition = FakeRecognition;
        renderModal();

        const body = screen.getByPlaceholderText(BODY_PLACEHOLDER);
        fireEvent.change(body, { target: { value: "le bouton ne repond pas" } });

        fireEvent.click(screen.getByLabelText("Dictate"));
        expect(screen.getByLabelText("Stop dictation").getAttribute("aria-pressed")).toBe("true");

        const recognition = FakeRecognition.instances[0];
        // The recognition callbacks fire outside React's event system.
        act(() => {
            recognition.onresult({ results: [[{ transcript: "sur l ecran d accueil" }]] });
        });
        expect(body.value).toBe("le bouton ne repond pas sur l ecran d accueil");

        fireEvent.click(screen.getByLabelText("Stop dictation"));
        expect(recognition.stopped).toBe(true);
        expect(screen.getByLabelText("Dictate").getAttribute("aria-pressed")).toBeNull();
    });

    it("stops dictation when the modal closes", () => {
        window.SpeechRecognition = FakeRecognition;
        renderModal();

        fireEvent.click(screen.getByLabelText("Dictate"));
        expect(FakeRecognition.instances).toHaveLength(1);

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(FakeRecognition.instances[0].stopped).toBe(true);
    });
});
