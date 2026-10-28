import { useState, useCallback, useMemo } from "react";

import { FeedbackModal } from "./FeedbackModal";

/**
 * useFeedback - Headless hook to trigger the feedback modal from an
 * existing menu, without rendering the default button.
 *
 * @param {Object} options
 * @param {string} options.relayPath - Relay endpoint path (required)
 * @param {string} options.appVersion - PWA version, sent as context
 * @param {Object} options.labels - Text overrides
 * @returns {{ isOpen: boolean, open: function, close: function, modal: React.ReactNode }}
 *
 * @example
 * const { open, modal } = useFeedback({ relayPath: "feedback/report", appVersion: "1.2.3" });
 * // In a menu:
 * <button onClick={open}>Signaler un problème</button>
 * {modal}
 */
export const useFeedback = (options = {}) => {
    const { relayPath, appVersion, labels } = options;

    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const modal = useMemo(() => (
        <FeedbackModal
            isOpen={isOpen}
            onClose={close}
            relayPath={relayPath}
            appVersion={appVersion}
            labels={labels}
        />
    ), [isOpen, close, relayPath, appVersion, labels]);

    return { isOpen, open, close, modal };
};
