import { useState, useEffect, useRef, useCallback } from "react";
import { isEmpty } from "lodash";
import { FaQrcode } from "react-icons/fa6";

import { useApi } from "lib/hooks";
import { Input, Button, Select, Boolean, BarcodeScanner } from "lib/components";
import { twMerge } from "lib/utils";

import {
    DEFAULT_LABELS,
    buildDefaultGetQrErrorLabel,
    defaultProps,
    extractPairingId,
    propTypes,
} from "./props";

export const LoginComponent = (props) => {
    const {
        onSuccess,
        onError,
        getErrorLabel,
        getQrErrorLabel,
        showEntities = true,
        showSharedDevice = true,
        enableQrPair = true,
        qrPollIntervalMs = 2000,
        qrTimeoutMs = 120000,
        deviceLabel,
        deviceUuid,
        abortTimeoutMs = 15000,
        entitiesTimeoutMs,
        loginTimeoutMs,
        containerProps = {},
        formProps = {},
        inputProps = {},
        passwordInputProps = {},
        selectProps = {},
        booleanProps = {},
        submitButtonProps = {},
        scanQrButtonProps = {},
        qrSeparatorProps = {},
        qrOverlayProps = {},
        errorAlertProps = {},
        qrErrorAlertProps = {},
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const resolvedEntitiesTimeoutMs = entitiesTimeoutMs ?? abortTimeoutMs;
    const resolvedLoginTimeoutMs = loginTimeoutMs ?? abortTimeoutMs;
    const resolveQrErrorLabel = getQrErrorLabel ?? buildDefaultGetQrErrorLabel(labels);

    const api = useApi();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [entity, setEntity] = useState("");
    // sharedDevice=true means the user explicitly flagged this access
    // as shared / untrusted (public computer, lent tablet, ...). The
    // payload sent to api.login is `rememberMe: !sharedDevice` so the
    // backend contract stays unchanged. Default false = trusted device,
    // credentials persisted (the safe, opt-out UX consumers asked for).
    const [sharedDevice, setSharedDevice] = useState(false);

    const [entities, setEntities] = useState([]);
    const [isGettingEntities, setIsGettingEntities] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // QR pairing state machine: 'password' | 'qr-scanning' | 'qr-claiming'
    //                           | 'qr-polling' | 'qr-error'
    const [mode, setMode] = useState("password");
    const [qrError, setQrError] = useState(null);

    const pairingIdRef = useRef(null);
    const claimTokenRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const pollTimeoutRef = useRef(null);

    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const resolveQrErrorLabelRef = useRef(resolveQrErrorLabel);
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);
    useEffect(() => { resolveQrErrorLabelRef.current = resolveQrErrorLabel; });

    // ---------------------- entities load ----------------------

    useEffect(() => {
        if (!showEntities || !api?.getEntities) return undefined;

        let cancelled = false;
        setIsGettingEntities(true);

        api.getEntities({ signal: AbortSignal.timeout(resolvedEntitiesTimeoutMs) })
            .then((data) => {
                if (cancelled) return;
                setEntities(data?.entities ?? []);
            })
            .catch(() => {
                // Silent: entities are optional. Some installations don't expose them.
                if (cancelled) return;
                setEntities([]);
            })
            .finally(() => {
                if (!cancelled) setIsGettingEntities(false);
            });

        return () => { cancelled = true; };
    }, [showEntities, api, resolvedEntitiesTimeoutMs]);

    // ---------------------- password submit ----------------------

    // HTML5 `required` on the inputs handles the empty-fields case at the
    // browser level (focus + native bubble per field). We don't duplicate
    // that with a JS-only "required field" message.
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        setSubmitError(null);
        setIsLoggingIn(true);

        try {
            const data = await api.login(
                {
                    email,
                    password,
                    entity: entity || undefined,
                    rememberMe: !sharedDevice,
                },
                { signal: AbortSignal.timeout(resolvedLoginTimeoutMs) }
            );
            onSuccessRef.current?.(data);
        } catch (err) {
            const message = getErrorLabel?.(err) ?? labels.loginError;
            setSubmitError(message);
            onErrorRef.current?.(err);
        } finally {
            setIsLoggingIn(false);
        }
    }, [api, email, password, entity, sharedDevice, resolvedLoginTimeoutMs, labels.loginError, getErrorLabel]);

    // ---------------------- QR pairing ----------------------

    const cleanupPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => () => cleanupPolling(), [cleanupPolling]);

    const startPolling = useCallback((pairingId, claimToken) => {
        cleanupPolling();

        const tick = async () => {
            try {
                const data = await api.pollQrPair(pairingId, claimToken);
                if (data?.status === "consumed") {
                    cleanupPolling();
                    setMode("password");
                    onSuccessRef.current?.(data);
                } else if (data?.status === "cancelled") {
                    cleanupPolling();
                    setQrError(labels.pairingCancelled);
                    setMode("qr-error");
                } else if (data?.status === "expired") {
                    cleanupPolling();
                    setQrError(labels.pairingExpired);
                    setMode("qr-error");
                }
            } catch (err) {
                cleanupPolling();
                setQrError(resolveQrErrorLabelRef.current(err));
                setMode("qr-error");
                onErrorRef.current?.(err);
            }
        };

        pollIntervalRef.current = setInterval(tick, qrPollIntervalMs);
        pollTimeoutRef.current = setTimeout(() => {
            cleanupPolling();
            setQrError(labels.pairingTimeout);
            setMode("qr-error");
        }, qrTimeoutMs);
    }, [api, qrPollIntervalMs, qrTimeoutMs, cleanupPolling, labels.pairingCancelled, labels.pairingExpired, labels.pairingTimeout]);

    const handleQrScan = useCallback(async (rawText) => {
        // Idempotence guard: a scanner that detects the same QR twice in
        // rapid succession (very common on Android with autofocus) would
        // otherwise trigger a second claim that is guaranteed to 409.
        // Anything past 'qr-scanning' means we've already started a claim.
        if (pairingIdRef.current) return;

        const pairingId = extractPairingId(rawText);
        if (!pairingId) {
            setQrError(labels.invalidQrError);
            setMode("qr-error");
            return;
        }
        pairingIdRef.current = pairingId;
        setMode("qr-claiming");

        try {
            const claimResponse = await api.claimQrPair(pairingId, {
                device_label: deviceLabel,
                device_uuid: deviceUuid,
            });
            if (!claimResponse?.claim_token) {
                throw new Error("missing claim_token in claim response");
            }
            claimTokenRef.current = claimResponse.claim_token;
            setMode("qr-polling");
            startPolling(pairingId, claimResponse.claim_token);
        } catch (err) {
            setQrError(resolveQrErrorLabelRef.current(err));
            setMode("qr-error");
            onErrorRef.current?.(err);
        }
    }, [api, deviceLabel, deviceUuid, startPolling, labels.invalidQrError]);

    const handleQrClose = useCallback(() => {
        cleanupPolling();
        pairingIdRef.current = null;
        claimTokenRef.current = null;
        setQrError(null);
        setMode("password");
    }, [cleanupPolling]);

    const startQrFlow = () => {
        setQrError(null);
        setMode("qr-scanning");
    };

    // ---------------------- render ----------------------

    // Only freeze the form while a login request is actually in flight.
    // Locking the inputs while entities are loading (which can take seconds
    // on a cold backend) silently swallowed every keystroke, including the
    // ones from automated test runners that fill very quickly. Entities
    // loading remains visible via the (still hidden) Select that only shows
    // up once `entities` is non-empty.
    const isFormDisabled = isLoggingIn;
    // Scanner is only open during the actual scan. Once we have the pairing
    // id and start /claim or /poll, we close the camera and show a
    // dedicated full-screen overlay (clearer UX than overlaying text on the
    // viewfinder, and a single Cancel button gets the user back).
    const scannerOpen = mode === "qr-scanning";
    const isClaimingOrPolling = mode === "qr-claiming" || mode === "qr-polling";

    return (
        <div
            data-component="LoginComponent"
            {...containerProps}
            className={twMerge("flex flex-col gap-4", containerProps.className)}
        >
            <form
                onSubmit={handleSubmit}
                {...formProps}
                className={twMerge("flex flex-col gap-4", formProps.className)}
            >
                <Input
                    id="login-email"
                    name="email"
                    type="text"
                    label={labels.emailLabel}
                    placeholder={labels.emailPlaceholder}
                    value={email}
                    onChange={setEmail}
                    readOnly={isFormDisabled}
                    required
                    {...inputProps}
                />
                <Input
                    id="login-password"
                    name="password"
                    type="password"
                    label={labels.passwordLabel}
                    placeholder={labels.passwordPlaceholder}
                    value={password}
                    onChange={setPassword}
                    readOnly={isFormDisabled}
                    required
                    {...passwordInputProps}
                />

                {showEntities && !isEmpty(entities) && (
                    <Select
                        id="login-entity"
                        name="entity"
                        label={labels.entityLabel}
                        placeholder={labels.entityPlaceholder}
                        value={entity}
                        onChange={setEntity}
                        readOnly={isFormDisabled}
                        options={entities.map(({ id, label }) => ({ label, value: id }))}
                        {...selectProps}
                    />
                )}

                {showSharedDevice && (
                    <Boolean
                        id="login-shared-device"
                        name="sharedDevice"
                        type="checkbox"
                        label={labels.sharedDeviceLabel}
                        value={sharedDevice}
                        onChange={setSharedDevice}
                        readOnly={isFormDisabled}
                        {...booleanProps}
                    />
                )}

                {submitError && (
                    <p
                        role="alert"
                        {...errorAlertProps}
                        className={twMerge("text-red-600 text-sm", errorAlertProps.className)}
                    >
                        {submitError}
                    </p>
                )}

                <Button
                    type="submit"
                    label={labels.submitLabel}
                    loading={isLoggingIn}
                    disabled={isFormDisabled}
                    {...submitButtonProps}
                />
            </form>

            {enableQrPair && (
                <>
                    <div
                        {...qrSeparatorProps}
                        className={twMerge(
                            "relative my-2",
                            qrSeparatorProps.className
                        )}
                    >
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-soft-bg text-soft-text">
                                {labels.qrSeparator}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={startQrFlow}
                        disabled={isFormDisabled}
                        {...scanQrButtonProps}
                        className={twMerge(
                            "flex items-center justify-center gap-3 w-full py-3 px-4 " +
                            "rounded-app-md border border-border bg-soft-bg " +
                            "hover:brightness-soft shadow-sm font-app-medium text-app-base " +
                            "transition-all disabled:opacity-50",
                            scanQrButtonProps.className
                        )}
                    >
                        <FaQrcode className="text-xl text-primary" />
                        <span>{labels.scanQrLabel}</span>
                    </button>
                </>
            )}

            {mode === "qr-error" && qrError && (
                <div
                    role="alert"
                    {...qrErrorAlertProps}
                    className={twMerge(
                        "rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700",
                        qrErrorAlertProps.className
                    )}
                >
                    <p>{qrError}</p>
                    <button
                        type="button"
                        onClick={() => { setQrError(null); setMode("password"); }}
                        className="mt-2 underline"
                    >
                        OK
                    </button>
                </div>
            )}

            {enableQrPair && (
                <BarcodeScanner
                    open={scannerOpen}
                    onClose={handleQrClose}
                    onScan={handleQrScan}
                    formats={["QR_CODE"]}
                    labels={{ title: labels.scannerTitle }}
                />
            )}

            {isClaimingOrPolling && (
                <div
                    role="status"
                    aria-live="polite"
                    {...qrOverlayProps}
                    className={twMerge(
                        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white p-6",
                        qrOverlayProps.className
                    )}
                >
                    <div className="size-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="mt-6 text-center text-lg max-w-md">
                        {mode === "qr-claiming" ? labels.claimingMessage : labels.pollingMessage}
                    </p>
                    <button
                        type="button"
                        onClick={handleQrClose}
                        className="mt-8 px-6 py-2 rounded-full border border-white/40 hover:bg-white/10"
                    >
                        {labels.cancelQrLabel}
                    </button>
                </div>
            )}
        </div>
    );
};

LoginComponent.propTypes = propTypes;
LoginComponent.defaultProps = defaultProps;
