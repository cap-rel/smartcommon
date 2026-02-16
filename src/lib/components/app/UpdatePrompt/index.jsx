import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { usePWAUpdate } from "lib/hooks";

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

    const defaultLabels = {
        title: "Mise à jour disponible",
        message: "Une nouvelle version est disponible.",
        reloadButton: "Rafraîchir",
        dismissButton: "Plus tard",
    };

    const mergedLabels = { ...defaultLabels, ...labels };

    const {
        updateAvailable,
        isApplying,
        applyUpdate,
    } = usePWAUpdate({
        autoReload,
        checkInterval,
        onUpdateAvailable,
        onUpdateActivated,
    });

    // Toast variant
    useEffect(() => {
        if (updateAvailable && variant === "toast") {
            toast(
                (t) => (
                    <div className="flex flex-col gap-2">
                        <p className="font-medium">{mergedLabels.title}</p>
                        <p className="text-sm text-gray-600">{mergedLabels.message}</p>
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    applyUpdate();
                                }}
                                disabled={isApplying}
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isApplying && (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {mergedLabels.reloadButton}
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {mergedLabels.dismissButton}
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: "bottom-center",
                }
            );
        }
    }, [updateAvailable, variant, applyUpdate, mergedLabels]);

    // Banner variant
    if (variant === "banner" && updateAvailable) {
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
                        <button
                            onClick={applyUpdate}
                            disabled={isApplying}
                            className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded hover:bg-blue-50 disabled:opacity-70 flex items-center gap-2"
                        >
                            {isApplying && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {mergedLabels.reloadButton}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Modal variant
    if (variant === "modal" && updateAvailable) {
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
                                onClick={applyUpdate}
                                disabled={isApplying}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isApplying && (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
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

export default UpdatePrompt;
