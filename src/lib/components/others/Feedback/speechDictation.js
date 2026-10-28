// Web Speech API wrapper for the feedback form. Dictation runs in fr-FR;
// the caller hides the mic button when the browser has no implementation.

import { createLogger } from "lib/utils";

const log = createLogger("FeedbackDictation");

export const isDictationSupported = () => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Start a dictation session. onResult receives each final transcript chunk,
// onEnd fires when the session stops (user or engine), onError on failure.
// Returns the recognition instance (the caller stops it), or null when
// unsupported or when start() throws.
export const startDictation = ({ locale = "fr-FR", onResult, onEnd, onError } = {}) => {
    if (!isDictationSupported()) return null;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Ctor();
    recognition.lang = locale;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results ?? [])
            .map((r) => r[0]?.transcript ?? "")
            .join(" ")
            .trim();
        if (transcript) onResult?.(transcript);
    };
    recognition.onerror = (event) => {
        // "aborted" and "no-speech" are routine ends, not failures.
        if (event?.error && event.error !== "aborted" && event.error !== "no-speech") {
            log.error("dictation error", event.error);
        }
        onError?.(event);
    };
    recognition.onend = () => onEnd?.();

    try {
        recognition.start();
    } catch (err) {
        log.error("dictation start failed", err?.message);
        onError?.(err);
        return null;
    }
    return recognition;
};
