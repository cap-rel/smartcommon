import { useState, useEffect, useRef, useCallback } from "react";
import { FaXmark, FaKeyboard } from "react-icons/fa6";

import {
    DEFAULT_FORMATS,
    DEFAULT_LABELS,
    defaultProps,
    propTypes,
} from "./props";

const SCANNER_ELEMENT_ID = "barcode-scanner-region";

// Html5QrcodeScannerState enum values:
//   NOT_STARTED = 1, SCANNING = 2, PAUSED = 3
// stop() throws synchronously when called from any state other than
// SCANNING/PAUSED, so the .catch() we put after it never fires. Hard-code
// the values here so we don't have to keep a reference to the lazy-loaded
// module just for the enum.
const SCANNER_STATE_SCANNING = 2;
const SCANNER_STATE_PAUSED = 3;

// Safely stop a Html5Qrcode instance: never throw, no-op if the scanner
// isn't in a stoppable state, and tolerant to a dead instance whose
// getState() itself throws.
const safeStopScanner = (scanner) => {
    if (!scanner) return;
    try {
        const state = typeof scanner.getState === "function"
            ? scanner.getState()
            : SCANNER_STATE_SCANNING; // assume started if no introspection
        if (state === SCANNER_STATE_SCANNING || state === SCANNER_STATE_PAUSED) {
            scanner.stop().catch(() => {});
        }
    } catch (_) {
        // getState() threw - the scanner instance is probably dead.
    }
};

export const BarcodeScanner = (props) => {
    const {
        open,
        onClose,
        onScan,
        continuous = false,
        formats = DEFAULT_FORMATS,
        fps = 10,
        qrbox = { width: 280, height: 150 },
        videoConstraints,
        experimentalFeatures = { useBarCodeDetectorIfSupported: true },
        embedded = false,
        debounceMs = 1500,
        feedbackContent,
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const html5QrCodeRef = useRef(null);
    const lastScanRef = useRef(null);
    const onScanRef = useRef(onScan);
    const onCloseRef = useRef(onClose);
    const continuousRef = useRef(continuous);
    const debounceMsRef = useRef(debounceMs);
    const formatsRef = useRef(formats);
    const fpsRef = useRef(fps);
    const qrboxRef = useRef(qrbox);
    const videoConstraintsRef = useRef(videoConstraints);
    const experimentalFeaturesRef = useRef(experimentalFeatures);
    const cameraErrorLabelRef = useRef(labels.cameraError);
    const cameraPermissionLabelRef = useRef(labels.cameraPermissionDenied);

    const [cameraError, setCameraError] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualBarcode, setManualBarcode] = useState("");

    useEffect(() => { onScanRef.current = onScan; }, [onScan]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { continuousRef.current = continuous; }, [continuous]);
    useEffect(() => { debounceMsRef.current = debounceMs; }, [debounceMs]);
    useEffect(() => { formatsRef.current = formats; }, [formats]);
    useEffect(() => { fpsRef.current = fps; }, [fps]);
    useEffect(() => { qrboxRef.current = qrbox; }, [qrbox]);
    useEffect(() => { videoConstraintsRef.current = videoConstraints; }, [videoConstraints]);
    useEffect(() => { experimentalFeaturesRef.current = experimentalFeatures; }, [experimentalFeatures]);
    useEffect(() => {
        cameraErrorLabelRef.current = labels.cameraError;
        cameraPermissionLabelRef.current = labels.cameraPermissionDenied;
    });

    useEffect(() => {
        if (!open) return undefined;

        setCameraError(null);
        setShowManualEntry(false);
        setManualBarcode("");
        lastScanRef.current = null;

        let cancelled = false;

        // html5-qrcode is heavy (~150kB). Lazy-load it only when the scanner
        // actually opens so projects that never scan don't pay for it.
        (async () => {
            let mod;
            try {
                mod = await import("html5-qrcode");
            } catch (err) {
                console.error("[BarcodeScanner] failed to load html5-qrcode:", err);
                if (!cancelled) {
                    setCameraError(cameraErrorLabelRef.current);
                }
                return;
            }
            if (cancelled) return;

            const { Html5Qrcode, Html5QrcodeSupportedFormats } = mod;

            const formatsToSupport = formatsRef.current
                .map((name) => Html5QrcodeSupportedFormats[name])
                .filter((v) => v !== undefined);

            const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                formatsToSupport,
                verbose: false,
            });
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: fpsRef.current,
                qrbox: qrboxRef.current,
                experimentalFeatures: experimentalFeaturesRef.current,
            };

            // If videoConstraints are provided, use them verbatim (full
            // MediaTrackConstraints control). Otherwise fall back to the
            // historical default of selecting the rear-facing camera.
            const cameraIdOrConfig = videoConstraintsRef.current
                || { facingMode: "environment" };

            html5QrCode.start(
                cameraIdOrConfig,
                config,
                (decodedText) => {
                    const now = Date.now();
                    if (
                        lastScanRef.current
                        && lastScanRef.current.text === decodedText
                        && now - lastScanRef.current.time < debounceMsRef.current
                    ) {
                        return;
                    }
                    lastScanRef.current = { text: decodedText, time: now };

                    if (navigator.vibrate) {
                        navigator.vibrate(100);
                    }

                    onScanRef.current(decodedText);

                    if (!continuousRef.current) {
                        safeStopScanner(html5QrCode);
                        onCloseRef.current();
                    }
                },
                () => {}
            ).catch((err) => {
                if (cancelled) return;
                const message = typeof err === "string" ? err : err?.message || "";
                if (message.toLowerCase().includes("permission")) {
                    setCameraError(cameraPermissionLabelRef.current);
                } else {
                    setCameraError(cameraErrorLabelRef.current);
                }
            });
        })();

        return () => {
            cancelled = true;
            if (html5QrCodeRef.current) {
                safeStopScanner(html5QrCodeRef.current);
                try {
                    html5QrCodeRef.current.clear()?.catch?.(() => {});
                } catch (_) {
                    // clear() can also throw synchronously on a stopped scanner.
                }
                html5QrCodeRef.current = null;
            }
        };
    }, [open]);

    const handleClose = useCallback(() => {
        safeStopScanner(html5QrCodeRef.current);
        onClose();
    }, [onClose]);

    const handleManualSubmit = useCallback(() => {
        const trimmed = manualBarcode.trim();
        if (!trimmed) return;

        if (navigator.vibrate) {
            navigator.vibrate(100);
        }

        onScan(trimmed);

        if (!continuous) {
            handleClose();
        } else {
            setManualBarcode("");
        }
    }, [manualBarcode, onScan, continuous, handleClose]);

    if (!open) return null;

    // Embedded mode: render only the camera region (and optional manual
    // entry fallback) inline. The parent component is responsible for
    // positioning, sizing, the close button and any surrounding chrome.
    if (embedded) {
        return (
            <div
                data-component="BarcodeScanner"
                data-embedded="true"
                className="relative flex flex-col"
            >
                <div className="flex flex-col items-center justify-center">
                    {cameraError ? (
                        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 max-w-sm text-center">
                            <p className="text-red-200 mb-3">{cameraError}</p>
                            <button
                                type="button"
                                onClick={() => setShowManualEntry(true)}
                                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium"
                            >
                                {labels.enterManually}
                            </button>
                        </div>
                    ) : (
                        <div
                            id={SCANNER_ELEMENT_ID}
                            className="w-full max-w-md rounded-xl overflow-hidden"
                        />
                    )}
                </div>

                {feedbackContent && (
                    <div className="py-2">{feedbackContent}</div>
                )}

                <div className="pt-2">
                    {showManualEntry || cameraError ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualBarcode}
                                onChange={(e) => setManualBarcode(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleManualSubmit(); }}
                                placeholder={labels.manualPlaceholder}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-primary focus:outline-none"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleManualSubmit}
                                disabled={!manualBarcode.trim()}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {labels.validate}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowManualEntry(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaKeyboard />
                            <span>{labels.enterManually}</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            data-component="BarcodeScanner"
            className="fixed inset-0 bg-black/90 z-50 flex flex-col"
        >
            <div className="flex items-center justify-between px-4 py-3 bg-black/50">
                <h2 className="text-white font-semibold text-lg">{labels.title}</h2>
                <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-full text-white hover:bg-white/20"
                    aria-label="Close"
                >
                    <FaXmark className="text-xl" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {cameraError ? (
                    <div className="bg-red-900/50 border border-red-500 rounded-xl p-6 max-w-sm text-center">
                        <p className="text-red-200 mb-4">{cameraError}</p>
                        <button
                            type="button"
                            onClick={() => setShowManualEntry(true)}
                            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium"
                        >
                            {labels.enterManually}
                        </button>
                    </div>
                ) : (
                    <div
                        id={SCANNER_ELEMENT_ID}
                        className="w-full max-w-md rounded-xl overflow-hidden"
                    />
                )}
            </div>

            {feedbackContent && (
                <div className="px-4 py-2">{feedbackContent}</div>
            )}

            <div className="px-4 pb-6 pt-2">
                {showManualEntry || cameraError ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleManualSubmit(); }}
                            placeholder={labels.manualPlaceholder}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-primary focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleManualSubmit}
                            disabled={!manualBarcode.trim()}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
                        >
                            {labels.validate}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowManualEntry(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-white/70 hover:text-white"
                    >
                        <FaKeyboard />
                        <span>{labels.enterManually}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

BarcodeScanner.propTypes = propTypes;
BarcodeScanner.defaultProps = defaultProps;
