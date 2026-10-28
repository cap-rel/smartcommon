import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { isDictationSupported, startDictation } from "./speechDictation";

// Fake SpeechRecognition: records its configuration and lets the test
// fire events by hand.
class FakeRecognition {
    constructor() {
        this.lang = null;
        this.continuous = null;
        this.interimResults = null;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
        this.started = false;
        this.stopped = false;
        FakeRecognition.instances.push(this);
    }

    start() {
        this.started = true;
    }

    stop() {
        this.stopped = true;
        this.onend?.();
    }
}
FakeRecognition.instances = [];

const transcriptEvent = (...transcripts) => ({
    results: transcripts.map((t) => [{ transcript: t }]),
});

describe("speechDictation", () => {
    beforeEach(() => {
        FakeRecognition.instances = [];
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
    });

    afterEach(() => {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
    });

    it("reports unsupported when the browser has no SpeechRecognition", () => {
        expect(isDictationSupported()).toBe(false);
    });

    it("detects the standard and the webkit-prefixed implementation", () => {
        window.SpeechRecognition = FakeRecognition;
        expect(isDictationSupported()).toBe(true);
        delete window.SpeechRecognition;
        window.webkitSpeechRecognition = FakeRecognition;
        expect(isDictationSupported()).toBe(true);
    });

    it("startDictation returns null when unsupported", () => {
        expect(startDictation({})).toBeNull();
    });

    it("configures the recognition for fr-FR, non-continuous, final results", () => {
        window.SpeechRecognition = FakeRecognition;
        const recognition = startDictation({});
        expect(recognition).toBe(FakeRecognition.instances[0]);
        expect(recognition.lang).toBe("fr-FR");
        expect(recognition.continuous).toBe(false);
        expect(recognition.interimResults).toBe(false);
        expect(recognition.started).toBe(true);
    });

    it("honours a custom locale", () => {
        window.SpeechRecognition = FakeRecognition;
        const recognition = startDictation({ locale: "en-US" });
        expect(recognition.lang).toBe("en-US");
    });

    it("forwards final transcripts to onResult and joins several results", () => {
        window.SpeechRecognition = FakeRecognition;
        const onResult = vi.fn();
        const recognition = startDictation({ onResult });
        recognition.onresult(transcriptEvent("bonjour", "le monde"));
        expect(onResult).toHaveBeenCalledWith("bonjour le monde");
    });

    it("ignores empty transcripts", () => {
        window.SpeechRecognition = FakeRecognition;
        const onResult = vi.fn();
        const recognition = startDictation({ onResult });
        recognition.onresult(transcriptEvent("   "));
        expect(onResult).not.toHaveBeenCalled();
    });

    it("fires onEnd when the session stops", () => {
        window.SpeechRecognition = FakeRecognition;
        const onEnd = vi.fn();
        const recognition = startDictation({ onEnd });
        recognition.stop();
        expect(recognition.stopped).toBe(true);
        expect(onEnd).toHaveBeenCalled();
    });

    it("forwards errors to onError", () => {
        window.SpeechRecognition = FakeRecognition;
        const onError = vi.fn();
        const recognition = startDictation({ onError });
        recognition.onerror({ error: "not-allowed" });
        expect(onError).toHaveBeenCalledWith({ error: "not-allowed" });
    });

    it("returns null and reports when start() throws", () => {
        window.SpeechRecognition = class extends FakeRecognition {
            start() {
                throw new Error("already started");
            }
        };
        const onError = vi.fn();
        expect(startDictation({ onError })).toBeNull();
        expect(onError).toHaveBeenCalled();
    });
});
