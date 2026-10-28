import { useState, useRef, useCallback, useEffect } from "react";
import { FaPaperPlane, FaImage, FaXmark, FaDesktop } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

import { Modal, Button, Input, Textarea, Select, PhotoEditor } from "lib/components";
import { useApi } from "lib/hooks";
import { createLogger, navigatorInfo } from "lib/utils";

import { DEFAULT_LABELS } from "./props";
import { buildContext, buildFormData, prepareScreenshot, RETRYABLE_RELAY_STATUS } from "./feedbackPayload";
import { captureScreen, canCaptureScreen } from "./screenshotCapture";
import { enqueueReport, setQueueApiProvider, installOnlineFlush, flushQueue } from "./offlineQueue";

const log = createLogger("Feedback");

const BODY_MAX_LENGTH = 20000;

/**
 * FeedbackModal - The report form in a modal. Controlled by `isOpen` /
 * `onClose`. Exported separately so useFeedback can mount it without
 * the button.
 */
export const FeedbackModal = (props) => {
    const {
        isOpen,
        onClose,
        relayPath,
        appVersion = "",
        labels: userLabels = {},
        photoEditorLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const api = useApi();

    // Register the api with the offline queue singleton and install the
    // 'online' flush listener once per mount. The queue is also flushed
    // right away: a report queued in a PREVIOUS session (app closed while
    // offline) must go out on reopen, and no 'online' event will fire for
    // it.
    useEffect(() => {
        setQueueApiProvider(api);
        installOnlineFlush();
        if (navigatorInfo.isOnLine !== false) {
            flushQueue().catch(err => log.error("mount flush failed", err));
        }
    }, [api]);

    const [type, setType] = useState("bug");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [consent, setConsent] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [result, setResult] = useState(null); // { ref, tracking_url }
    const [errorMessage, setErrorMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [isRedacting, setIsRedacting] = useState(false);

    const fileInputRef = useRef(null);
    const idempotencyKeyRef = useRef(null);
    const formContainerRef = useRef(null);
    const previewUrlRef = useRef(null);

    // Single entry point for the screenshot state: revokes the previous
    // object URL so previews never leak across edits.
    const updateScreenshot = useCallback((file) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        if (file) {
            previewUrlRef.current = URL.createObjectURL(file);
        }
        setScreenshot(file);
        setScreenshotPreview(previewUrlRef.current);
    }, []);

    // Move focus into the dialog when it opens, so screen reader users
    // land on the form instead of the page behind the modal.
    useEffect(() => {
        if (isOpen && status === "idle" && formContainerRef.current) {
            const timer = setTimeout(() => {
                const firstFocusable = formContainerRef.current?.querySelector(
                    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
                );
                firstFocusable?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, status]);

    const resetForm = useCallback(() => {
        updateScreenshot(null);
        setType("bug");
        setTitle("");
        setBody("");
        setConsent(false);
        setStatus("idle");
        setResult(null);
        setErrorMessage("");
        setValidationErrors({});
        idempotencyKeyRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [updateScreenshot]);

    const handleClose = useCallback(() => {
        // While the redaction editor is open, every close path (Escape,
        // the X button, an overlay click) must stay inert: closing would
        // reset the form and lose the report being typed. The editor has
        // its own Cancel / Save.
        if (isRedacting) return;
        resetForm();
        onClose?.();
    }, [isRedacting, resetForm, onClose]);

    const handleScreenshotChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setValidationErrors(prev => ({ ...prev, screenshot: labels.errorMessage }));
            return;
        }

        // Reduce before storing: the capTests limit is 5120 KB on the
        // wire; we target 2 MB and 1920 px so the multipart upload stays
        // fast on a mobile uplink.
        const prepared = await prepareScreenshot(file);

        updateScreenshot(prepared);
        setValidationErrors(prev => {
            const { screenshot: _removed, ...rest } = prev;
            return rest;
        });
    }, [labels, updateScreenshot]);

    const removeScreenshot = useCallback(() => {
        updateScreenshot(null);
        setConsent(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [updateScreenshot]);

    // Redaction runs in PhotoEditor (redact tool only) on the full
    // resolution image; the edited blob is reduced again before storage.
    const handleRedactDone = useCallback(async (blob) => {
        try {
            const file = blob instanceof File
                ? blob
                : new File([blob], `redacted-${Date.now()}.png`, { type: blob?.type || "image/png" });
            const prepared = await prepareScreenshot(file);
            updateScreenshot(prepared);
            // A redacted image still requires explicit consent.
            setConsent(false);
        } catch (err) {
            log.error("redaction failed", err?.message);
        } finally {
            setIsRedacting(false);
        }
    }, [updateScreenshot]);

    const handleRedactCancel = useCallback(() => {
        setIsRedacting(false);
    }, []);

    // Desktop screen capture via getDisplayMedia. The modal hides itself
    // during the capture so the screenshot does not show the form.
    const handleCaptureScreen = useCallback(async () => {
        setIsCapturing(true);
        try {
            const file = await captureScreen({
                hideModal: () => setIsCapturing(true),
                showModal: () => setIsCapturing(false),
            });
            if (file) {
                updateScreenshot(file);
            }
        } catch (err) {
            log.error("screen capture failed", err?.message);
        } finally {
            setIsCapturing(false);
        }
    }, [updateScreenshot]);

    const validate = useCallback(() => {
        const errors = {};

        if (!body.trim()) {
            errors.body = labels.bodyRequiredError;
        } else if (body.length > BODY_MAX_LENGTH) {
            errors.body = labels.bodyTooLongError(BODY_MAX_LENGTH);
        }

        if (screenshot && !consent) {
            errors.consent = labels.screenshotConsentRequiredError;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [body, screenshot, consent, labels]);

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;

        // Generate the idempotency key once per report; a retry after a
        // network cut must reuse the SAME key so the relay does not create
        // a duplicate.
        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = uuidv4();
        }

        setStatus("submitting");
        setErrorMessage("");

        // The context describes the moment of the problem. It is captured
        // NOW so a report queued offline keeps this context when the flush
        // resends it later (the retry must not describe the flush moment).
        const context = buildContext(appVersion);

        const payload = {
            type,
            title: title.trim() || undefined,
            body: body.trim(),
            screenshot,
            consent,
            appVersion,
            relayPath,
            context,
        };

        // Offline at submit time: queue the report, it will be flushed
        // automatically on the next 'online' event. The idempotency key
        // is preserved so the flush never creates a duplicate.
        if (navigatorInfo.isOnLine === false) {
            try {
                await enqueueReport(payload, idempotencyKeyRef.current);
                setResult({ ref: null, trackingUrl: null, deferred: true });
                setStatus("success");
                log.info("report queued (offline)", idempotencyKeyRef.current);
                return;
            } catch (err) {
                log.error("failed to queue report", err);
                setErrorMessage(labels.errorMessage);
                setStatus("error");
                return;
            }
        }

        const formData = buildFormData(payload);

        try {
            const response = await api.post(relayPath, {
                body: formData,
                headers: {
                    "Idempotency-Key": idempotencyKeyRef.current,
                },
            });

            // The relay answers { ok, ref, tracking_url } on success,
            // { ok: false, error, code } on failure.
            if (response?.ok && response?.ref) {
                setResult({
                    ref: response.ref,
                    trackingUrl: response.tracking_url,
                });
                setStatus("success");
                log.info("report sent", response.ref);
                // A successful send also flushes any earlier queued reports.
                flushQueue().catch(err => log.error("post-submit flush failed", err));
            } else {
                setErrorMessage(response?.error || labels.errorMessage);
                setStatus("error");
                log.error("report rejected", response?.code ?? "unknown");
            }
        } catch (error) {
            // api.post throws on any non-2xx (ky throwHttpErrors), so the
            // relay's refusal arrives here as an error carrying the response.
            // A definitive refusal (400, 403, 413, ...) is shown as an error
            // and NEVER queued: resending the same content can only fail
            // again. Only a transient refusal (429, 502, 503) is worth a
            // deferred retry, like a network failure.
            const status = error?.response?.status;
            if (typeof status === "number" && !RETRYABLE_RELAY_STATUS.includes(status)) {
                log.error("report rejected by the relay", status, error?.apiMessage);
                setErrorMessage(error?.apiMessage || labels.errorMessage);
                setStatus("error");
                return;
            }

            // No response (network cut, timeout) or a transient refusal:
            // queue for retry. The same idempotency key guarantees no
            // duplicate on flush.
            log.error("report send failed, queueing for retry", error?.message);
            try {
                await enqueueReport(payload, idempotencyKeyRef.current);
                setResult({ ref: null, trackingUrl: null, deferred: true });
                setStatus("success");
            } catch (queueErr) {
                log.error("failed to queue report after network error", queueErr);
                setErrorMessage(labels.errorMessage);
                setStatus("error");
            }
        }
    }, [api, relayPath, type, title, body, screenshot, consent, appVersion, validate, labels]);

    const typeOptions = [
        { value: "bug", label: labels.typeBug },
        { value: "idea", label: labels.typeIdea },
    ];

    return (
        <Modal
            isOpen={isOpen && !isCapturing}
            onClose={handleClose}
            title={labels.title}
            size="md"
            position="bottom"
        >
            <div
                ref={formContainerRef}
                className="p-4 flex flex-col gap-4"
                data-component="FeedbackModal"
                aria-live="polite"
            >
                {status === "success" ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-green-600 font-medium">
                            {result?.deferred ? labels.deferredTitle : labels.successTitle}
                        </div>
                        {result?.deferred ? (
                            <p className="text-gray-700" role="status" aria-live="polite">
                                {labels.offlineMessage}
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-700">
                                    {labels.successMessage(result?.ref)}
                                </p>
                                {result?.trackingUrl && (
                                    <a
                                        href={result.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline"
                                    >
                                        {labels.successTracking}
                                    </a>
                                )}
                            </>
                        )}
                        <Button
                            label={labels.closeLabel}
                            onClick={handleClose}
                            className="w-full"
                        />
                    </div>
                ) : (
                    <>
                        <Select
                            label={labels.typeLabel}
                            value={type}
                            onChange={(value) => setType(value)}
                            options={typeOptions}
                        />

                        <Input
                            label={labels.titleLabel}
                            value={title}
                            onChange={(value) => setTitle(value)}
                            placeholder={labels.titlePlaceholder}
                            maxLength={255}
                        />

                        <Textarea
                            label={labels.bodyLabel}
                            value={body}
                            onChange={(value) => setBody(value)}
                            placeholder={labels.bodyPlaceholder}
                            rows={5}
                            textareaProps={{
                                "aria-invalid": validationErrors.body ? "true" : undefined,
                                "aria-describedby": validationErrors.body ? "feedback-body-error" : undefined,
                            }}
                        />
                        {validationErrors.body && (
                            <span id="feedback-body-error" className="text-xs text-red-600" role="alert">
                                {validationErrors.body}
                            </span>
                        )}
                        {body.length > 0 && (
                            <div className="text-xs text-gray-400 text-right" aria-hidden="true">
                                {body.length}/{BODY_MAX_LENGTH}
                            </div>
                        )}

                        {/* Screenshot: file input (mobile) + screen capture (desktop) + redaction */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {labels.screenshotLabel}
                            </span>
                            {isRedacting && screenshotPreview ? (
                                <PhotoEditor
                                    open
                                    src={screenshotPreview}
                                    tools={["redact"]}
                                    labels={photoEditorLabels}
                                    onSave={handleRedactDone}
                                    onCancel={handleRedactCancel}
                                />
                            ) : screenshotPreview ? (
                                <div className="flex flex-col gap-2">
                                    <img
                                        src={screenshotPreview}
                                        alt={labels.screenshotLabel}
                                        className="max-h-48 object-contain rounded-lg border border-gray-200"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRedacting(true)}
                                            className="text-sm text-gray-600 hover:underline flex items-center gap-1"
                                        >
                                            <FaImage />
                                            {labels.redactLabel}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeScreenshot}
                                            className="text-sm text-red-600 hover:underline flex items-center gap-1"
                                        >
                                            <FaXmark />
                                            {labels.screenshotRemove}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                    >
                                        <FaImage />
                                        {labels.screenshotChoose}
                                    </button>
                                    {canCaptureScreen() && (
                                        <button
                                            type="button"
                                            onClick={handleCaptureScreen}
                                            disabled={isCapturing}
                                            className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <FaDesktop />
                                            {labels.screenshotCapture}
                                        </button>
                                    )}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                className="hidden"
                                aria-label={labels.screenshotChoose}
                            />
                            {validationErrors.screenshot && (
                                <span className="text-xs text-red-600">
                                    {validationErrors.screenshot}
                                </span>
                            )}
                        </div>

                        {/* Consent: required when a screenshot is attached */}
                        {screenshot && (
                            <label className="flex items-start gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="mt-0.5"
                                    aria-describedby={validationErrors.consent ? "feedback-consent-error" : undefined}
                                    aria-invalid={validationErrors.consent ? "true" : undefined}
                                />
                                <span>{labels.screenshotConsentLabel}</span>
                            </label>
                        )}
                        {validationErrors.consent && (
                            <span id="feedback-consent-error" className="text-xs text-red-600" role="alert">
                                {validationErrors.consent}
                            </span>
                        )}

                        {status === "error" && (
                            <div
                                className="text-sm text-red-600"
                                role="alert"
                                aria-live="assertive"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <Button
                                label={labels.cancelLabel}
                                onClick={handleClose}
                                variant="ghost"
                                className="flex-1"
                            />
                            <Button
                                label={status === "submitting" ? labels.submittingLabel : labels.submitLabel}
                                onClick={handleSubmit}
                                disabled={status === "submitting"}
                                icon={<FaPaperPlane />}
                                className="flex-1"
                                aria-busy={status === "submitting" ? "true" : undefined}
                            />
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
