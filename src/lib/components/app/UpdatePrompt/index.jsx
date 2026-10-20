import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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
 * Displays a notification when a new version is available. Updating is not
 * optional: the prompt offers a single button and stays until it is used.
 *
 * @param {Object} props
 * @param {boolean} props.autoReload - Auto-reload when update activates (default: false)
 * @param {number} props.checkInterval - Interval in ms to check for updates (default: 0)
 * @param {"toast"|"banner"|"modal"} props.variant - Display variant (default: "toast")
 * @param {string} props.position - Position for banner variant: "top" | "bottom" (default: "bottom")
 * @param {string|null} props.versionUrl - Build version file read on detection (see usePWAUpdate)
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
        versionUrl,
        onUpdateAvailable,
        onUpdateActivated,
    } = props;

    const mergedLabels = { ...DEFAULT_LABELS, ...labels };

    const onUpdateAvailableRef = useRef(onUpdateAvailable);
    const labelsRef = useRef(mergedLabels);
    const toastIdRef = useRef(null);

    useLayoutEffect(() => {
        onUpdateAvailableRef.current = onUpdateAvailable;
        labelsRef.current = mergedLabels;
    });

    // Stable identity: usePWAUpdate re-subscribes to the Service Worker
    // whenever this callback changes.
    const handleUpdateAvailable = useCallback(() => {
        onUpdateAvailableRef.current?.();
    }, []);

    const {
        updateAvailable,
        newVersion,
        releaseNotes,
        isApplying,
        applyUpdate,
    } = usePWAUpdate({
        autoReload,
        checkInterval,
        versionUrl,
        onUpdateAvailable: handleUpdateAvailable,
        onUpdateActivated,
    });

    const visible = updateAvailable;

    const messageFor = (l) => {
        if (!newVersion) {
            return l.message;
        }
        return typeof l.messageWithVersion === "function"
            ? l.messageWithVersion(newVersion)
            : l.messageWithVersion;
    };
    const message = messageFor(mergedLabels);

    // Toast variant. Created once per visible prompt, then updated in place
    // (same id) when the version info arrives: re-running on every render
    // (labels are a fresh object each time) used to stack a new toast.
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
        const toastLabels = labelsRef.current;
        const toastMessage = messageFor(toastLabels);
        toastIdRef.current = toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium">{toastLabels.title}</p>
                    <p className="text-sm text-gray-600">{toastMessage}</p>
                    {releaseNotes && (
                        <p className="text-xs text-gray-500 whitespace-pre-line max-h-32 overflow-y-auto">{releaseNotes}</p>
                    )}
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
                    </div>
                </div>
            ),
            {
                ...(toastIdRef.current !== null ? { id: toastIdRef.current } : {}),
                duration: Infinity,
                position: "bottom-center",
            }
        );
    }, [visible, variant, applyUpdate, newVersion, releaseNotes]);

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
                            <p className="text-sm opacity-90">{message}</p>
                            {releaseNotes && (
                                <p className="text-xs opacity-80 mt-1 whitespace-pre-line max-h-24 overflow-y-auto">{releaseNotes}</p>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
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
                        <p className={`text-gray-600 ${releaseNotes ? "mb-2" : "mb-4"}`}>{message}</p>
                        {releaseNotes && (
                            <p className="text-sm text-gray-500 mb-4 whitespace-pre-line max-h-48 overflow-y-auto">{releaseNotes}</p>
                        )}
                        <div className="flex gap-3 justify-end">
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
