import { useState, useRef, useCallback } from "react";
import { FaPaperPlane, FaImage, FaXmark } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

import { Modal, Button, Input, Textarea, Select } from "lib/components";
import { useApi } from "lib/hooks";
import { createLogger, getRecentLogs, getRecentNetworkErrors, navigatorInfo } from "lib/utils";

import { DEFAULT_LABELS } from "./props";

const log = createLogger("Feedback");

const BODY_MAX_LENGTH = 20000;
const SCREENSHOT_MAX_BYTES = 5120 * 1024; // 5120 KB

// Strip the query string from a URL: it can carry tokens.
const stripQuery = (url) => {
    const q = url.indexOf("?");
    return q === -1 ? url : url.slice(0, q);
};

// Build the context block sent with every report. Identity fields
// (reporter, rights, installed_version) are NEVER set here: the relay
// fills them from the smartauth token server-side.
const buildContext = (appVersion) => {
    const pageUrl = typeof window !== "undefined"
        ? stripQuery(window.location.href)
        : "";

    return {
        channel: "pwa",
        app_version: appVersion || undefined,
        page_url: pageUrl || undefined,
        route: pageUrl ? new URL(pageUrl).pathname : undefined,
        viewport: typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : undefined,
        locale: navigatorInfo.language || undefined,
        occurred_at: new Date().toISOString(),
        log_excerpt: getRecentLogs(),
        network_errors: getRecentNetworkErrors(),
    };
};

// Build the multipart form. The screenshot is appended as a File when
// present; consent is "1" or "0".
const buildFormData = ({ type, title, body, screenshot, consent, appVersion }) => {
    const formData = new FormData();
    const context = buildContext(appVersion);

    formData.append("type", type);
    if (title) formData.append("title", title);
    formData.append("body", body);

    // Flatten the context object into bracket-notation fields so the PHP
    // relay can validate them with Laravel's native dot-notation rules.
    formData.append("context[channel]", context.channel);
    if (context.app_version) formData.append("context[app_version]", context.app_version);
    if (context.page_url) formData.append("context[page_url]", context.page_url);
    if (context.route) formData.append("context[route]", context.route);
    if (context.viewport) formData.append("context[viewport]", context.viewport);
    if (context.locale) formData.append("context[locale]", context.locale);
    formData.append("context[occurred_at]", context.occurred_at);

    (context.log_excerpt ?? []).forEach((line, i) => {
        formData.append(`context[log_excerpt][${i}]`, line);
    });
    (context.network_errors ?? []).forEach((err, i) => {
        formData.append(`context[network_errors][${i}][method]`, err.method);
        formData.append(`context[network_errors][${i}][url]`, err.url);
        formData.append(`context[network_errors][${i}][status]`, String(err.status));
        formData.append(`context[network_errors][${i}][at]`, err.at);
    });

    if (screenshot) {
        formData.append("screenshot", screenshot, screenshot.name || "screenshot.jpg");
        formData.append("screenshot_consent", consent ? "1" : "0");
    }

    return formData;
};

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

    const handleScreenshotChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setValidationErrors(prev => ({ ...prev, screenshot: labels.errorMessage }));
            return;
        }

        if (file.size > SCREENSHOT_MAX_BYTES) {
            setValidationErrors(prev => ({
                ...prev,
                screenshot: labels.bodyTooLongError(Math.round(SCREENSHOT_MAX_BYTES / 1024)),
            }));
            return;
        }

        setScreenshot(file);
        setScreenshotPreview(URL.createObjectURL(file));
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

        const formData = buildFormData({
            type,
            title: title.trim() || undefined,
            body: body.trim(),
            screenshot,
            consent,
            appVersion,
        });

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
            } else {
                setErrorMessage(response?.error || labels.errorMessage);
                setStatus("error");
                log.error("report rejected", response?.code ?? "unknown");
            }
        } catch (error) {
            // Network failure or non-JSON response: keep the idempotency
            // key so a retry does not duplicate.
            log.error("report send failed", error?.message);
            setErrorMessage(labels.errorMessage);
            setStatus("error");
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
            <div className="p-4 flex flex-col gap-4" data-component="FeedbackModal">
                {status === "success" ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-green-600 font-medium">
                            {labels.successTitle}
                        </div>
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
                        />
                        {body.length > 0 && (
                            <div className="text-xs text-gray-400 text-right">
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
                                />
                                <span>{labels.screenshotConsentLabel}</span>
                            </label>
                        )}
                        {validationErrors.consent && (
                            <span className="text-xs text-red-600" role="alert">
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
                            />
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
