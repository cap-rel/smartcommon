import { useCallback, useEffect, useRef, useState } from "react";

import { createLogger } from "lib/utils";

const log = createLogger("Feedback");

// Web Speech API constructor, prefixed in Chromium and Safari. Null when the
// browser has none (Firefox, most WebViews): the dictation button is hidden.
export const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

// Language of the dictation: the one the app declares on <html lang>, else
// the browser one. The recognizer needs a BCP 47 tag ("fr-FR", "de").
export const getDictationLang = () => {
    if (typeof document !== "undefined" && document.documentElement?.lang) {
        return document.documentElement.lang;
    }
    if (typeof navigator !== "undefined" && navigator.language) {
        return navigator.language;
    }
    return "en-US";
};

/**
 * Speech-to-text for one text field, through the browser Web Speech API.
 *
 * Each final phrase is passed to `onText`; the caller appends it to its
 * value. Listening stops after one utterance (browser decision), on a
 * second toggle, on error, and on unmount.
 *
 * @param {object} options
 * @param {(text: string) => void} options.onText Receives each recognized phrase
 * @param {string} [options.lang] BCP 47 language, defaults to getDictationLang()
 * @returns {{ isSupported: boolean, isListening: boolean, error: string|null, toggle: () => void, stop: () => void }}
 */
export const useDictation = ({ onText, lang } = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const onTextRef = useRef(onText);

    useEffect(() => {
        onTextRef.current = onText;
    }, [onText]);

    const isSupported = getSpeechRecognition() !== null;

    const stop = useCallback(() => {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        setIsListening(false);
        if (recognition) {
            try {
                recognition.stop();
            } catch (err) {
                log.warning("dictation stop failed", err?.message);
            }
        }
    }, []);

    const start = useCallback(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            log.warning("dictation requested but the Web Speech API is missing");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang || getDictationLang();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result?.[0]?.transcript?.trim();
                if (result?.isFinal !== false && text) {
                    onTextRef.current?.(text);
                }
            }
        };
        recognition.onerror = (event) => {
            // "no-speech" and "aborted" are a silence or a stop, not a failure.
            if (event?.error !== "no-speech" && event?.error !== "aborted") {
                log.warning("dictation failed", event?.error);
                setError(event?.error || "unknown");
            }
        };
        recognition.onend = () => {
            if (recognitionRef.current === recognition) {
                recognitionRef.current = null;
            }
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (err) {
            log.warning("dictation start failed", err?.message);
            setError(err?.name || "start-failed");
            return;
        }
        recognitionRef.current = recognition;
        setError(null);
        setIsListening(true);
    }, [lang]);

    const toggle = useCallback(() => {
        if (recognitionRef.current) {
            stop();
        } else {
            start();
        }
    }, [start, stop]);

    useEffect(() => () => {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        if (recognition) {
            try {
                recognition.abort();
            } catch (err) {
                log.warning("dictation abort failed", err?.message);
            }
        }
    }, []);

    return { isSupported, isListening, error, toggle, stop };
};
