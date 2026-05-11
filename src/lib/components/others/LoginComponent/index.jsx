import { useState, useEffect, useRef, useCallback } from "react";
import { isEmpty } from "lodash";
import { FaQrcode } from "react-icons/fa6";

import { useApi } from "lib/hooks";
import { Input, Button, Select, BarcodeScanner, DevicePicker } from "lib/components";
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
        // Styling slot + label overrides forwarded to the embedded
        // <DevicePicker> when the post-login pick is in flight. Each
        // one is optional: the picker falls back to its own defaults.
        devicePickerProps = {},
        devicePickerLabels: userDevicePickerLabels = {},
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const devicePickerLabels = userDevicePickerLabels;
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
    //                           | 'qr-polling' | 'qr-error' | 'device-pick'
    // 'device-pick' is entered after a successful login response that
    // carries `needs_device_pick: true`: the access/refresh tokens are
    // already valid (the smartAuth backend issued them anyway, the
    // attachment to a logical user-device is a separate side-effect),
    // and we render <DevicePicker> instead of `onSuccess` until the
    // user has picked / created a logical device.
    const [mode, setMode] = useState("password");
    const [qrError, setQrError] = useState(null);

    // Pending login response captured during password / QR success when
    // the backend signals `needs_device_pick: true`. We keep it here so
    // we can hand it to `onSuccess` once the user has chosen a device.
    // null when no device-pick is in flight.
    const [pendingDevicePick, setPendingDevicePick] = useState(null);
    const [devicePickError, setDevicePickError] = useState(null);
    const [devicePickLoading, setDevicePickLoading] = useState(false);

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
            // If the backend signals the technical device is not yet
            // attached to a logical user-device, defer onSuccess and
            // switch to the device-pick mode. Tokens are already
            // persisted by useApi.login() so the JWT-protected
            // /account/user-devices endpoints called from <DevicePicker>
            // work as-is.
            if (data?.needsDevicePick === true) {
                setPendingDevicePick({
                    response: data,
                    existingDevices: Array.isArray(data?.existingUserDevices)
                        ? data.existingUserDevices
                        : [],
                });
                setDevicePickError(null);
                setMode("device-pick");
                return;
            }
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
                    // Mirror the password path: if the QR-pair response
                    // carries `needs_device_pick: true` (snake_case from
                    // the backend, untouched by pollQrPair's response
                    // shaping), defer onSuccess and switch to the
                    // device-pick view.
                    if (data?.needs_device_pick === true) {
                        setPendingDevicePick({
                            response: data,
                            existingDevices: Array.isArray(data?.existing_user_devices)
                                ? data.existing_user_devices
                                : [],
                        });
                        setDevicePickError(null);
                        setMode("device-pick");
                        return;
                    }
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

    // ---------------------- device-pick (post-login) ----------------------

    const finaliseDevicePick = useCallback(() => {
        // Hand the pending login response back to the parent. Tokens
        // were already persisted by useApi.login() so no extra wiring
        // is required: the parent simply sees the auth as resolved.
        const response = pendingDevicePick?.response;
        setPendingDevicePick(null);
        setDevicePickError(null);
        setDevicePickLoading(false);
        setMode("password");
        onSuccessRef.current?.(response);
    }, [pendingDevicePick]);

    const handleDevicePickExisting = useCallback(async (userDeviceId) => {
        if (!api?.linkUserDevice) {
            setDevicePickError(labels.devicePickMissingApiError);
            return;
        }
        setDevicePickLoading(true);
        setDevicePickError(null);
        try {
            await api.linkUserDevice(userDeviceId);
            finaliseDevicePick();
        } catch (err) {
            // Prefer the backend-provided machine code/message when
            // available (set by useApi.beforeError) over the generic
            // fallback label.
            const fallback = labels.devicePickError;
            const message = err?.apiMessage ?? fallback;
            setDevicePickError(message);
            onErrorRef.current?.(err);
        } finally {
            setDevicePickLoading(false);
        }
    }, [api, labels.devicePickError, labels.devicePickMissingApiError, finaliseDevicePick]);

    const handleDevicePickCreate = useCallback(async (label, icon) => {
        if (!api?.createUserDevice) {
            setDevicePickError(labels.devicePickMissingApiError);
            return;
        }
        setDevicePickLoading(true);
        setDevicePickError(null);
        try {
            await api.createUserDevice({ label, icon });
            finaliseDevicePick();
        } catch (err) {
            const fallback = labels.devicePickError;
            const message = err?.apiMessage ?? fallback;
            setDevicePickError(message);
            onErrorRef.current?.(err);
        } finally {
            setDevicePickLoading(false);
        }
    }, [api, labels.devicePickError, labels.devicePickMissingApiError, finaliseDevicePick]);

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

    // When the post-login device-pick is in flight, take over the whole
    // render tree: the password form and the QR section are hidden so
    // the user can't accidentally restart the login while we wait for
    // them to attach the device. Tokens are already persisted by the
    // useApi.login() side-effect, so we never lose auth state if the
    // user reloads at this point -- they would just land on the
    // post-auth route directly (the parent's RouteGuard / router takes
    // over from there).
    if (mode === "device-pick" && pendingDevicePick) {
        return (
            <div
                data-component="LoginComponent"
                data-mode="device-pick"
                {...containerProps}
                className={twMerge("flex flex-col gap-4", containerProps.className)}
            >
                <DevicePicker
                    existingDevices={pendingDevicePick.existingDevices}
                    onPick={handleDevicePickExisting}
                    onCreate={handleDevicePickCreate}
                    loading={devicePickLoading}
                    error={devicePickError}
                    labels={devicePickerLabels}
                    {...devicePickerProps}
                />
            </div>
        );
    }

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
                    // Native <label> wrapping the input + span: clicking
                    // anywhere in the styled container toggles the checkbox.
                    // Keeps the case + text on a single visual row even when
                    // the label is long (the span wraps inside the row).
                    <label
                        htmlFor="login-shared-device"
                        {...booleanProps}
                        className={twMerge(
                            "flex items-start gap-app-sm p-app-sm rounded-app-md " +
                            "border border-border bg-soft-bg cursor-pointer " +
                            "hover:brightness-soft",
                            isFormDisabled && "opacity-60 cursor-not-allowed",
                            booleanProps.className
                        )}
                    >
                        <input
                            id="login-shared-device"
                            name="sharedDevice"
                            type="checkbox"
                            checked={sharedDevice}
                            onChange={(e) => setSharedDevice(e.target.checked)}
                            disabled={isFormDisabled}
                            className="mt-1 size-4 accent-primary cursor-pointer flex-shrink-0"
                        />
                        <span className="text-app-sm leading-snug">
                            {labels.sharedDeviceLabel}
                        </span>
                    </label>
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
