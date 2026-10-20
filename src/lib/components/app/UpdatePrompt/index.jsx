import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { usePWAUpdate } from "lib/hooks";

import { DEFAULT_LABELS, propTypes } from "./props";

const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

/**
 * PWA Update Prompt component.
 * Displays a notification when a new version is available.
 *
 * @param {Object} props
 * @param {boolean} props.autoReload - Auto-reload when update activates (default: false)
 * @param {number} props.checkInterval - Interval in ms to check for updates (default: 0)
 * @param {"toast"|"banner"|"modal"} props.variant - Display variant (default: "toast")
 * @param {string} props.position - Position for banner variant: "top" | "bottom" (default: "bottom")
 * @param {Object} props.labels - Custom labels
 * @param {Function} props.onUpdateAvailable - Callback when update is available
 * @param {Function} props.onUpdateActivated - Callback when update is activated
 */
export const UpdatePrompt = (props) => {
    const {
        autoReload = false,
        checkInterval = 0,
        variant = "toast",
        position = "bottom",
        labels = {},
        onUpdateAvailable,
        onUpdateActivated,
    } = props;

    const mergedLabels = { ...DEFAULT_LABELS, ...labels };

    // Each detection bumps the counter; "Later" remembers the detection it
    // dismissed, so the prompt stays hidden until the next one.
    const [detectionCount, setDetectionCount] = useState(0);
    const [dismissedAt, setDismissedAt] = useState(null);

    const onUpdateAvailableRef = useRef(onUpdateAvailable);
    const labelsRef = useRef(mergedLabels);
    const toastIdRef = useRef(null);
    const detectionRef = useRef(detectionCount);

    useLayoutEffect(() => {
        onUpdateAvailableRef.current = onUpdateAvailable;
        labelsRef.current = mergedLabels;
        detectionRef.current = detectionCount;
    });

    // Stable identity: usePWAUpdate re-subscribes to the Service Worker
    // whenever this callback changes.
    const handleUpdateAvailable = useCallback(() => {
        setDetectionCount((c) => c + 1);
        onUpdateAvailableRef.current?.();
    }, []);

    const {
        updateAvailable,
        isApplying,
        applyUpdate,
    } = usePWAUpdate({
        autoReload,
        checkInterval,
        onUpdateAvailable: handleUpdateAvailable,
        onUpdateActivated,
    });

    const visible = updateAvailable && dismissedAt !== detectionCount;

    // Reads the ref so the toast, rendered once, still dismisses the latest
    // detection rather than the one current when it was created.
    const dismiss = useCallback(() => {
        setDismissedAt(detectionRef.current);
    }, []);

    // Toast variant. Created once per visible prompt: re-running on every
    // render (labels are a fresh object each time) used to stack a new toast,
    // bringing it back right after "Later".
    useEffect(() => {
        if (variant !== "toast") {
            return;
        }
        if (!visible) {
            if (toastIdRef.current !== null) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            return;
        }
        if (toastIdRef.current !== null) {
            return;
        }
        const toastLabels = labelsRef.current;
        toastIdRef.current = toast(
                (t) => (
                    <div className="flex flex-col gap-2">
                        <p className="font-medium">{toastLabels.title}</p>
                        <p className="text-sm text-gray-600">{toastLabels.message}</p>
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    applyUpdate();
                                }}
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                {toastLabels.reloadButton}
                            </button>
                            <button
                                onClick={dismiss}
                                className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {toastLabels.dismissButton}
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: "bottom-center",
                }
            );
    }, [visible, variant, applyUpdate, dismiss]);

    // Unmount: a toast lives outside this component and would outlast it.
    useEffect(() => () => {
        if (toastIdRef.current !== null) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }
    }, []);

    // Banner variant
    if (variant === "banner" && visible) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: position === "top" ? -100 : 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: position === "top" ? -100 : 100 }}
                    className={`fixed left-0 right-0 z-50 px-4 py-3 bg-blue-600 text-white shadow-lg ${
                        position === "top" ? "top-0" : "bottom-0"
                    }`}
                >
                    <div className="flex items-center justify-between max-w-screen-lg mx-auto">
                        <div>
                            <p className="font-medium">{mergedLabels.title}</p>
                            <p className="text-sm opacity-90">{mergedLabels.message}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={dismiss}
                                disabled={isApplying}
                                className="px-4 py-2 text-sm font-medium text-white border border-white/60 rounded hover:bg-white/10 disabled:opacity-70"
                            >
                                {mergedLabels.dismissButton}
                            </button>
                            <button
                                onClick={applyUpdate}
                                disabled={isApplying}
                                className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded hover:bg-blue-50 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isApplying && <Spinner />}
                                {mergedLabels.reloadButton}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Modal variant
    if (variant === "modal" && visible) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full"
                    >
                        <h2 className="text-lg font-semibold mb-2">{mergedLabels.title}</h2>
                        <p className="text-gray-600 mb-4">{mergedLabels.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={dismiss}
                                disabled={isApplying}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-70"
                            >
                                {mergedLabels.dismissButton}
                            </button>
                            <button
                                onClick={applyUpdate}
                                disabled={isApplying}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isApplying && <Spinner />}
                                {mergedLabels.reloadButton}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Toast variant renders via react-hot-toast, no JSX needed here
    return null;
};

UpdatePrompt.propTypes = propTypes;

export default UpdatePrompt;
