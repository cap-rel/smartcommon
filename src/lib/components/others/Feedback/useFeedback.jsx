import { useState, useCallback, useMemo, useRef, useEffect } from "react";

import { FeedbackModal } from "./FeedbackModal";

/**
 * useFeedback - Headless hook to trigger the feedback modal from an
 * existing menu, without rendering the default button.
 *
 * @param {Object} options
 * @param {string} options.relayPath - Relay endpoint path (required)
 * @param {string} options.appVersion - PWA version, sent as context
 * @param {Object} options.labels - Text overrides
 * @param {Object} options.photoEditorLabels - Text overrides for the
 *   redaction editor (merged over PhotoEditor's DEFAULT_LABELS)
 * @returns {{ isOpen: boolean, open: function, close: function, modal: React.ReactNode }}
 *
 * @example
 * const { open, modal } = useFeedback({ relayPath: "feedback/report", appVersion: "1.2.3" });
 * // In a menu:
 * <button onClick={open}>Signaler un problème</button>
 * {modal}
 */
export const useFeedback = (options = {}) => {
    const { relayPath, appVersion, labels, photoEditorLabels } = options;

    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const wasOpenRef = useRef(false);

    const open = useCallback(() => {
        // Remember what had the focus so close() can hand it back: the
        // hook is meant to be opened from an existing menu item.
        triggerRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    // Modal does not restore focus on close: hand it back to the element
    // that opened the window (same contract as FeedbackButton).
    useEffect(() => {
        if (wasOpenRef.current && !isOpen) {
            triggerRef.current?.focus();
            triggerRef.current = null;
        }
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    const modal = useMemo(() => (
        <FeedbackModal
            isOpen={isOpen}
            onClose={close}
            relayPath={relayPath}
            appVersion={appVersion}
            labels={labels}
            photoEditorLabels={photoEditorLabels}
        />
    ), [isOpen, close, relayPath, appVersion, labels, photoEditorLabels]);

    return { isOpen, open, close, modal };
};
