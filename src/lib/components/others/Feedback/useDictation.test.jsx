import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
    post: vi.fn(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" })),
}));

vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useApi: () => ({ post: mocks.post }) };
});

// The offline queue needs IndexedDB, which happy-dom does not provide.
vi.mock("./offlineQueue", () => ({
    enqueueReport: vi.fn(async () => ({})),
    setQueueApiProvider: vi.fn(),
    installOnlineFlush: vi.fn(),
    flushQueue: vi.fn(async () => {}),
}));

import { FeedbackModal } from "./FeedbackModal";
import { getDictationLang } from "./useDictation";

const BODY_PLACEHOLDER = "What happened? What were you trying to do?";

// Fake of the browser recognizer: records its settings and lets the test
// fire the events the browser would.
class FakeRecognition {
    static instances = [];

    constructor() {
        this.start = vi.fn();
        this.stop = vi.fn(() => this.onend?.());
        this.abort = vi.fn();
        FakeRecognition.instances.push(this);
    }

    say(text) {
        this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });
    }
}

const renderModal = (props = {}) =>
    render(<FeedbackModal isOpen onClose={() => {}} relayPath="feedback/report" {...props} />);

const lastRecognition = () => FakeRecognition.instances.at(-1);

describe("Feedback dictation", () => {
    beforeEach(() => {
        FakeRecognition.instances = [];
    });

    afterEach(() => {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
        document.documentElement.removeAttribute("lang");
    });

    it("hides the dictation button when the browser has no Web Speech API", () => {
        renderModal();
        expect(screen.queryByRole("button", { name: "Dictate" })).toBeNull();
    });

    it("listens in the language of the app and appends each phrase to the description", () => {
        window.webkitSpeechRecognition = FakeRecognition;
        document.documentElement.setAttribute("lang", "fr-FR");
        renderModal();

        fireEvent.change(screen.getByPlaceholderText(BODY_PLACEHOLDER), { target: { value: "Le bouton" } });
        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));

        const recognition = lastRecognition();
        expect(recognition.lang).toBe("fr-FR");
        expect(recognition.start).toHaveBeenCalledTimes(1);
        const stopButton = screen.getByRole("button", { name: "Stop dictation" });
        expect(stopButton.getAttribute("aria-pressed")).toBe("true");

        act(() => recognition.say("ne répond plus"));
        expect(screen.getByPlaceholderText(BODY_PLACEHOLDER).value).toBe("Le bouton ne répond plus");
    });

    it("uses the dictationLang prop over the page language", () => {
        window.SpeechRecognition = FakeRecognition;
        document.documentElement.setAttribute("lang", "fr-FR");
        renderModal({ dictationLang: "de-DE" });

        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
        expect(lastRecognition().lang).toBe("de-DE");
    });

    it("stops listening on a second click", () => {
        window.SpeechRecognition = FakeRecognition;
        renderModal();

        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
        fireEvent.click(screen.getByRole("button", { name: "Stop dictation" }));

        expect(lastRecognition().stop).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "Dictate" }).getAttribute("aria-pressed")).toBe("false");
    });

    it("shows an error when the microphone is refused, but not on silence", () => {
        window.SpeechRecognition = FakeRecognition;
        renderModal();

        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
        act(() => {
            lastRecognition().onerror({ error: "no-speech" });
            lastRecognition().onend();
        });
        expect(screen.queryByText(/Dictation failed/)).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
        act(() => {
            lastRecognition().onerror({ error: "not-allowed" });
            lastRecognition().onend();
        });
        expect(screen.getByRole("alert").textContent).toMatch(/Dictation failed/);
    });

    it("aborts the recognition when the form unmounts", () => {
        window.SpeechRecognition = FakeRecognition;
        const { unmount } = renderModal();

        fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
        unmount();
        expect(lastRecognition().abort).toHaveBeenCalledTimes(1);
    });

    it("falls back to the browser language without <html lang>", () => {
        expect(getDictationLang()).toBe(navigator.language || "en-US");
    });
});
