import { useState, useEffect, useRef, useCallback } from "react";
import { isEmpty } from "lodash";
import { FaQrcode } from "react-icons/fa6";

import { useApi } from "lib/hooks";
import { Input, Button, Select, Boolean, BarcodeScanner } from "lib/components";

import { DEFAULT_LABELS, defaultProps, extractPairingId, propTypes } from "./props";

export const LoginComponent = (props) => {
    const {
        onSuccess,
        onError,
        showEntities = true,
        showRememberMe = false,
        enableQrPair = false,
        qrPollIntervalMs = 2000,
        qrTimeoutMs = 120000,
        deviceLabel,
        deviceUuid,
        abortTimeoutMs = 15000,
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const api = useApi();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [entity, setEntity] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

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
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    // ---------------------- entities load ----------------------

    useEffect(() => {
        if (!showEntities || !api?.getEntities) return undefined;

        let cancelled = false;
        setIsGettingEntities(true);

        api.getEntities({ signal: AbortSignal.timeout(abortTimeoutMs) })
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
    }, [showEntities, api, abortTimeoutMs]);

    // ---------------------- password submit ----------------------

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) {
            setSubmitError(labels.requiredField);
            return;
        }
        setSubmitError(null);
        setIsLoggingIn(true);

        try {
            const data = await api.login(
                {
                    email,
                    password,
                    entity: entity || undefined,
                    rememberMe,
                },
                { signal: AbortSignal.timeout(abortTimeoutMs) }
            );
            onSuccessRef.current?.(data);
        } catch (err) {
            setSubmitError(labels.loginError);
            onErrorRef.current?.(err);
        } finally {
            setIsLoggingIn(false);
        }
    }, [api, email, password, entity, rememberMe, abortTimeoutMs, labels.loginError, labels.requiredField]);

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
                setQrError(labels.claimError);
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
    }, [api, qrPollIntervalMs, qrTimeoutMs, cleanupPolling, labels.pairingCancelled, labels.pairingExpired, labels.pairingTimeout, labels.claimError]);

    const handleQrScan = useCallback(async (rawText) => {
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
            setQrError(labels.claimError);
            setMode("qr-error");
            onErrorRef.current?.(err);
        }
    }, [api, deviceLabel, deviceUuid, startPolling, labels.invalidQrError, labels.claimError]);

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

    const isFormDisabled = isLoggingIn || isGettingEntities;
    const scannerOpen = mode === "qr-scanning"
        || mode === "qr-claiming"
        || mode === "qr-polling";

    const scannerFeedback = mode === "qr-claiming"
        ? <p className="text-white text-center">{labels.claimingMessage}</p>
        : mode === "qr-polling"
            ? <p className="text-white text-center">{labels.pollingMessage}</p>
            : null;

    return (
        <div data-component="LoginComponent" className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    id="login-email"
                    name="email"
                    type="email"
                    label={labels.emailLabel}
                    placeholder={labels.emailPlaceholder}
                    value={email}
                    onChange={setEmail}
                    readOnly={isFormDisabled}
                    required
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
                    />
                )}

                {showRememberMe && (
                    <Boolean
                        id="login-remember-me"
                        name="rememberMe"
                        type="checkbox"
                        label={labels.rememberMeLabel}
                        value={rememberMe}
                        onChange={setRememberMe}
                        readOnly={isFormDisabled}
                    />
                )}

                {submitError && (
                    <p role="alert" className="text-red-600 text-sm">{submitError}</p>
                )}

                <Button
                    type="submit"
                    label={labels.submitLabel}
                    loading={isLoggingIn}
                    disabled={isFormDisabled}
                />
            </form>

            {enableQrPair && (
                <button
                    type="button"
                    onClick={startQrFlow}
                    disabled={isFormDisabled}
                    className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                    <FaQrcode />
                    <span>{labels.scanQrLabel}</span>
                </button>
            )}

            {mode === "qr-error" && qrError && (
                <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
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
                    feedbackContent={scannerFeedback}
                />
            )}
        </div>
    );
};

LoginComponent.propTypes = propTypes;
LoginComponent.defaultProps = defaultProps;
