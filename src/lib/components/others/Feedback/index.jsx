import { useState, useCallback, useRef, useEffect } from "react";
import { FaBug } from "react-icons/fa6";

import { propTypes, defaultProps, DEFAULT_LABELS } from "./props";
import { FeedbackModal } from "./FeedbackModal";

/**
 * FeedbackButton - "Report a problem" button + modal form for PWAs.
 *
 * The PWA posts multipart to a module relay (prop relayPath); the relay
 * forwards to capTests with the intake key. The capTests key never
 * reaches the browser.
 *
 * @param {Object} props
 * @param {string} props.relayPath - Relay endpoint path (required)
 * @param {boolean} props.visible - Show the button (module decides by right)
 * @param {string} props.appVersion - PWA version, sent as context
 * @param {Object} props.labels - Text overrides (merged over DEFAULT_LABELS)
 * @param {Object} props.photoEditorLabels - Text overrides for the
 *   redaction editor (merged over PhotoEditor's DEFAULT_LABELS)
 */
export const FeedbackButton = (props) => {
    const {
        relayPath,
        visible = true,
        appVersion = "",
        labels: userLabels = {},
        photoEditorLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const wasOpenRef = useRef(false);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);

    // Modal does not restore focus on close: hand it back to the trigger
    // button so keyboard and screen reader users land where they started.
    useEffect(() => {
        if (wasOpenRef.current && !isOpen) {
            buttonRef.current?.focus();
        }
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    if (!visible) return null;

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                aria-label={labels.buttonLabel}
            >
                <FaBug />
                <span>{labels.buttonLabel}</span>
            </button>

            <FeedbackModal
                isOpen={isOpen}
                onClose={closeModal}
                relayPath={relayPath}
                appVersion={appVersion}
                labels={userLabels}
                photoEditorLabels={photoEditorLabels}
            />
        </>
    );
};

FeedbackButton.propTypes = propTypes;
FeedbackButton.defaultProps = defaultProps;

export { FeedbackModal } from "./FeedbackModal";
export { useFeedback } from "./useFeedback";
