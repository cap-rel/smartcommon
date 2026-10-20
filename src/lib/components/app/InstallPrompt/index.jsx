import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { INSTALL_PROMPT_OPEN_EVENT, useInstallPrompt } from "lib/hooks";
import { createLogger } from "lib/utils";

import { DEFAULT_LABELS, propTypes } from "./props";

const log = createLogger("InstallPrompt");

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
 * Numbered install steps. On iOS the first step is "tap Share", so it
 * shows the Share glyph instead of a number.
 */
const StepList = ({ steps, withShareIcon }) => (
    <ol className="space-y-3 text-sm text-gray-700">
        {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
                {withShareIcon && index === 0 ? (
                    <ShareIcon className="w-6 h-6 shrink-0 text-blue-600" />
                ) : (
                    <span className="w-6 shrink-0 text-center font-semibold text-blue-600">{index + 1}</span>
                )}
                <span>{step}</span>
            </li>
        ))}
    </ol>
);

/**
 * PWA install invitation.
 *
 * Renders nothing until the app is offerable: not already installed,
 * not dismissed recently, and not before minVisits. Chromium gets a
 * button that opens the browser's own install dialog; every other
 * browser gets the steps of its own menu (see detectInstallGuide), or
 * the advice to reopen the page in a browser that can install. See
 * useInstallPrompt for what "installed" can and cannot mean on the web.
 *
 * openInstallPrompt() opens it on demand, past the reminder policy, for
 * an explicit "Install the app" entry; closing it then is not a refusal.
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

    const mergedLabels = {
        ...DEFAULT_LABELS,
        ...labels,
        guides: { ...DEFAULT_LABELS.guides, ...labels.guides },
    };

    const {
        shouldOffer,
        canPrompt,
        installGuide,
        promptInstall,
        dismiss,
    } = useInstallPrompt({ remindAfterDays, minVisits, report, onInstalled });

    // Banner only: "Install" without a native prompt opens the steps.
    const [showSteps, setShowSteps] = useState(false);
    // Opened through openInstallPrompt(), whatever shouldOffer says.
    const [forced, setForced] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const onOpen = () => {
            log.info("opened on demand", installGuide);
            setForced(true);
        };

        window.addEventListener(INSTALL_PROMPT_OPEN_EVENT, onOpen);
        return () => window.removeEventListener(INSTALL_PROMPT_OPEN_EVENT, onOpen);
    }, [installGuide]);

    const isIos = installGuide === "ios";
    const guides = mergedLabels.guides;
    const steps = isIos
        ? guides.ios ?? [mergedLabels.iosStep1, mergedLabels.iosStep2, mergedLabels.iosStep3]
        : guides[installGuide] ?? guides.unknown;
    const stepsTitle = isIos ? mergedLabels.iosTitle : mergedLabels.stepsTitle;

    const handleInstall = async () => {
        if (canPrompt) {
            await promptInstall();
            setForced(false);
            return;
        }
        setShowSteps(true);
    };

    const handleDismiss = () => {
        setShowSteps(false);
        if (forced) {
            // The user opened it themselves: closing is not a refusal.
            setForced(false);
            return;
        }
        dismiss();
        onDismiss?.();
    };

    if (!shouldOffer && !forced) return null;

    const dismissButton = (
        <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
            {mergedLabels.dismissButton}
        </button>
    );

    const primaryButtonClass = "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700";

    const installButton = (
        <button type="button" onClick={handleInstall} className={primaryButtonClass}>
            {mergedLabels.installButton}
        </button>
    );

    const gotItButton = (
        <button type="button" onClick={handleDismiss} className={primaryButtonClass}>
            {mergedLabels.gotItButton}
        </button>
    );

    if (variant === "modal" || forced || showSteps) {
        // From the banner, the steps replace it; otherwise the steps sit
        // under the message whenever no native prompt can do the job.
        const stepsOnly = showSteps && !forced && variant !== "modal";
        const withSteps = showSteps || !canPrompt;

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
                    role="dialog"
                    aria-modal="true"
                    data-testid={stepsOnly ? "install-prompt-steps" : "install-prompt"}
                >
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        className="w-full max-w-sm m-4 p-5 bg-white rounded-xl"
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            {stepsOnly ? stepsTitle : mergedLabels.title}
                        </h2>
                        {!stepsOnly && (
                            <p className="text-sm text-gray-600 mb-4">{mergedLabels.message}</p>
                        )}
                        {withSteps && (
                            <div data-testid="install-prompt-guide" data-guide={installGuide}>
                                {!stepsOnly && <p className="text-sm font-medium mb-2">{stepsTitle}</p>}
                                <StepList steps={steps} withShareIcon={isIos} />
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-5">
                            {withSteps ? gotItButton : <>{dismissButton}{installButton}</>}
                        </div>
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
                    <div className="flex gap-2 shrink-0">
                        {dismissButton}
                        {installButton}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

InstallPrompt.propTypes = propTypes;

export default InstallPrompt;
