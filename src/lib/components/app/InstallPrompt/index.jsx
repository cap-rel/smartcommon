import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useInstallPrompt } from "lib/hooks";

import { DEFAULT_LABELS, propTypes } from "./props";

/**
 * iOS share glyph, drawn inline so the component carries no icon
 * dependency. It is the button users must find in the Safari toolbar,
 * so showing it beats describing it.
 */
const ShareIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M12 15V3" />
        <path d="m8 7 4-4 4 4" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
);

/**
 * PWA install invitation.
 *
 * Renders nothing until the app is offerable: not already installed,
 * not dismissed recently, and either a native prompt is available
 * (Chromium) or the platform needs manual steps (iOS). See
 * useInstallPrompt for what "installed" can and cannot mean on the web.
 *
 * Mount it ONCE, high in the tree (next to UpdatePrompt), inside the
 * authenticated area if you want the install state reported to
 * smartAuth.
 *
 * @param {Object} props
 * @param {"banner"|"modal"} [props.variant="banner"]
 * @param {"top"|"bottom"} [props.position="bottom"] banner position
 * @param {number} [props.remindAfterDays=14] days before re-offering after a refusal
 * @param {number} [props.minVisits=2] visits before the first invitation
 * @param {boolean} [props.report=true] report the install state to smartAuth
 * @param {Object} [props.labels] translated strings
 * @param {Function} [props.onInstalled]
 * @param {Function} [props.onDismiss]
 */
export const InstallPrompt = (props) => {
    const {
        variant = "banner",
        position = "bottom",
        remindAfterDays = 14,
        minVisits = 2,
        report = true,
        labels = {},
        onInstalled,
        onDismiss,
    } = props;

    const mergedLabels = { ...DEFAULT_LABELS, ...labels };

    const {
        shouldOffer,
        canPrompt,
        needsManualInstructions,
        promptInstall,
        dismiss,
    } = useInstallPrompt({ remindAfterDays, minVisits, report, onInstalled });

    // iOS has no programmatic install: tapping "Install" can only show
    // the manual steps.
    const [showIosSteps, setShowIosSteps] = useState(false);

    const handleInstall = async () => {
        if (canPrompt) {
            await promptInstall();
            return;
        }
        if (needsManualInstructions) {
            setShowIosSteps(true);
        }
    };

    const handleDismiss = () => {
        setShowIosSteps(false);
        dismiss();
        onDismiss?.();
    };

    if (!shouldOffer) return null;

    if (showIosSteps) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
                    data-testid="install-prompt-ios-steps"
                >
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        className="w-full max-w-sm m-4 p-5 bg-white rounded-xl"
                    >
                        <h2 className="text-lg font-semibold mb-3">{mergedLabels.iosTitle}</h2>
                        <ol className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-center gap-3">
                                <ShareIcon className="w-6 h-6 shrink-0 text-blue-600" />
                                <span>{mergedLabels.iosStep1}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 shrink-0 text-center font-semibold text-blue-600">2</span>
                                <span>{mergedLabels.iosStep2}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 shrink-0 text-center font-semibold text-blue-600">3</span>
                                <span>{mergedLabels.iosStep3}</span>
                            </li>
                        </ol>
                        <div className="flex justify-end mt-5">
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                {mergedLabels.gotItButton}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    const actions = (
        <div className="flex gap-2 shrink-0">
            <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
                {mergedLabels.dismissButton}
            </button>
            <button
                type="button"
                onClick={handleInstall}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
                {mergedLabels.installButton}
            </button>
        </div>
    );

    if (variant === "modal") {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    data-testid="install-prompt"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-sm m-4 p-5 bg-white rounded-xl"
                    >
                        <h2 className="text-lg font-semibold mb-2">{mergedLabels.title}</h2>
                        <p className="text-sm text-gray-600 mb-4">{mergedLabels.message}</p>
                        <div className="flex justify-end">{actions}</div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: position === "top" ? -80 : 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: position === "top" ? -80 : 80 }}
                className={`fixed left-0 right-0 z-50 px-4 py-3 bg-white border-soft-border ${
                    position === "top" ? "top-0 border-b" : "bottom-0 border-t"
                }`}
                // Keeps the buttons above the iOS home indicator.
                style={position === "bottom" ? { paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" } : undefined}
                data-testid="install-prompt"
            >
                <div className="flex items-center justify-between gap-4 max-w-screen-lg mx-auto">
                    <div className="min-w-0">
                        <p className="font-medium truncate">{mergedLabels.title}</p>
                        <p className="text-sm text-gray-600">{mergedLabels.message}</p>
                    </div>
                    {actions}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

InstallPrompt.propTypes = propTypes;

export default InstallPrompt;
