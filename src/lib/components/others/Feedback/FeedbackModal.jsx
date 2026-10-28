import { useState, useRef, useCallback, useEffect } from "react";
import { FaPaperPlane, FaImage, FaXmark } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

import { Modal, Button, Input, Textarea, Select } from "lib/components";
import { useApi } from "lib/hooks";
import { createLogger, navigatorInfo } from "lib/utils";

import { DEFAULT_LABELS } from "./props";
import { buildFormData, prepareScreenshot } from "./feedbackPayload";
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
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const api = useApi();

    // Register the api with the offline queue singleton and install the
    // 'online' flush listener once per mount.
    useEffect(() => {
        setQueueApiProvider(api);
        installOnlineFlush();
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

    const fileInputRef = useRef(null);
    const idempotencyKeyRef = useRef(null);
    const formContainerRef = useRef(null);

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
        setType("bug");
        setTitle("");
        setBody("");
        setScreenshot(null);
        setScreenshotPreview(null);
        setConsent(false);
        setStatus("idle");
        setResult(null);
        setErrorMessage("");
        setValidationErrors({});
        idempotencyKeyRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose?.();
    }, [resetForm, onClose]);

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

        setScreenshot(prepared);
        setScreenshotPreview(URL.createObjectURL(prepared));
        setValidationErrors(prev => {
            const { screenshot: _removed, ...rest } = prev;
            return rest;
        });
    }, [labels]);

    const removeScreenshot = useCallback(() => {
        setScreenshot(null);
        if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
        setScreenshotPreview(null);
        setConsent(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [screenshotPreview]);

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

        const payload = {
            type,
            title: title.trim() || undefined,
            body: body.trim(),
            screenshot,
            consent,
            appVersion,
            relayPath,
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
            // Network failure mid-submit: queue for retry. The same
            // idempotency key guarantees no duplicate on flush.
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
            isOpen={isOpen}
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
                            {labels.successTitle}
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
                            onChange={(e) => setType(e.target.value)}
                            options={typeOptions}
                        />

                        <Input
                            label={labels.titleLabel}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={labels.titlePlaceholder}
                            maxLength={255}
                        />

                        <Textarea
                            label={labels.bodyLabel}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={labels.bodyPlaceholder}
                            error={validationErrors.body}
                            rows={5}
                            aria-invalid={validationErrors.body ? "true" : undefined}
                            aria-describedby={validationErrors.body ? "feedback-body-error" : undefined}
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

                        {/* Screenshot: file input (mobile + desktop fallback) */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {labels.screenshotLabel}
                            </span>
                            {screenshotPreview ? (
                                <div className="flex flex-col gap-2">
                                    <img
                                        src={screenshotPreview}
                                        alt={labels.screenshotLabel}
                                        className="max-h-48 object-contain rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeScreenshot}
                                        className="self-start text-sm text-red-600 hover:underline flex items-center gap-1"
                                    >
                                        <FaXmark />
                                        {labels.screenshotRemove}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    <FaImage />
                                    {labels.screenshotChoose}
                                </button>
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
