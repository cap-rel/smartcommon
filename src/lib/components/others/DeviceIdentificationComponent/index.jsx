import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { isEmpty } from "lodash";
import { MdDevices } from "react-icons/md";

import { useApi } from "lib/hooks";
import { Input, Button, Checker } from "lib/components";
import { detectAutoViewport } from "lib/components/app/ViewportProvider";
import { ViewportContext } from "lib/components/app/ViewportProvider/context";
import { twMerge } from "lib/utils";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

export const DeviceIdentificationComponent = (props) => {
    const {
        onSuccess,
        onError,
        getErrorLabel,
        noDeviceValue = "noDevice",
        icon: Icon = MdDevices,
        abortTimeoutMs = 15000,
        identifyTimeoutMs,
        enableViewportMode = true,
        defaultViewportMode,
        containerProps = {},
        formProps = {},
        iconWrapperProps = {},
        iconProps = {},
        titleProps = {},
        descriptionProps = {},
        devicesCheckerProps = {},
        labelInputProps = {},
        viewportModeCheckerProps = {},
        submitButtonProps = {},
        errorAlertProps = {},
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const resolvedTimeoutMs = identifyTimeoutMs ?? abortTimeoutMs;

    const api = useApi();
    // Read the viewport context directly (not via useViewport) to
    // tolerate a missing ViewportProvider: in that case the context
    // value is null and we silently skip the viewport sync after
    // identification. useViewport() would throw, which is not what
    // we want for a backward-compatible component.
    const viewport = useContext(ViewportContext);

    const deviceOptions = api?.user?.deviceOptions;
    const existingUserDevices = api?.user?.existingUserDevices;
    const hasDeviceOptions = !isEmpty(deviceOptions);

    const [label, setLabel] = useState("");
    const [uuid, setUuid] = useState("");
    // viewportMode is the user's radio choice on the "new device"
    // path. Pre-selected from `defaultViewportMode` if explicitly
    // provided, otherwise from `detectAutoViewport()` (the same
    // heuristic ViewportProvider uses internally). Computed once at
    // mount via lazy initial state -- recomputing on every render
    // would jitter the radio when the parent re-renders.
    const [viewportMode, setViewportMode] = useState(
        () => defaultViewportMode ?? detectAutoViewport(),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    // The "new device" path is used when there is no option to pick from
    // OR when the user explicitly picked the "new device" radio option.
    const isCreatingNewDevice = !hasDeviceOptions || uuid === noDeviceValue;

    const handleDeviceChange = useCallback((value) => {
        if (value !== noDeviceValue) {
            setLabel("");
        }
        setUuid(value);
    }, [noDeviceValue]);

    // Resolve the viewport_mode that smartcommon should apply after a
    // successful identification:
    //   - new device path : the value chosen via the radio
    //   - existing device path : the viewport_mode stored on the
    //     matching logical user_device (found by joining the picked
    //     technical device's label to `existingUserDevices`)
    // Returns null when no value applies (e.g. legacy device without
    // a stored viewport_mode, or the join fails).
    const resolveAppliedViewportMode = useCallback(() => {
        if (isCreatingNewDevice) {
            return viewportMode;
        }
        if (!Array.isArray(existingUserDevices) || existingUserDevices.length === 0) {
            return null;
        }
        const pickedOption = deviceOptions?.find((o) => o.uuid === uuid);
        if (!pickedOption) return null;
        const matched = existingUserDevices.find((d) => d.label === pickedOption.label);
        return matched?.viewport_mode ?? null;
    }, [isCreatingNewDevice, viewportMode, existingUserDevices, deviceOptions, uuid]);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!api?.identifyDevice) return;

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const body = { label, uuid };
            if (enableViewportMode && isCreatingNewDevice) {
                // Only forward the viewport_mode on the new device path.
                // On the existing device path the backend already knows
                // the stored value; sending it would overwrite the user's
                // previous explicit choice.
                body.viewport_mode = viewportMode;
            }
            const data = await api.identifyDevice(
                body,
                { signal: AbortSignal.timeout(resolvedTimeoutMs) }
            );

            // Apply the viewport choice locally (reload via setPreference)
            // when it differs from the current preference. We compare
            // against `viewport.preference` (not `viewport.viewport`) so
            // that an explicit user choice survives an environment change
            // (e.g. user later opens a sandboxed iframe where auto-detect
            // would give a different answer).
            const applied = resolveAppliedViewportMode();
            if (viewport && applied && applied !== viewport.preference) {
                // setPreference reloads the page; do not invoke onSuccess
                // first because the caller would race with the reload.
                await viewport.setPreference(applied, { silent: true });
                return;
            }
            onSuccessRef.current?.(data);
        } catch (err) {
            const message = getErrorLabel?.(err) ?? labels.identifyError;
            setSubmitError(message);
            onErrorRef.current?.(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        api, label, uuid, viewportMode, enableViewportMode, isCreatingNewDevice,
        resolvedTimeoutMs, getErrorLabel, labels.identifyError, viewport,
        resolveAppliedViewportMode,
    ]);

    const checkerOptions = hasDeviceOptions
        ? [
            ...deviceOptions.map((opt) => ({ label: opt.label, value: opt.uuid })),
            { label: labels.noDeviceLabel, value: noDeviceValue },
        ]
        : [];

    const viewportModeOptions = useMemo(() => [
        { label: labels.viewportModeOptionAuto, value: "auto" },
        { label: labels.viewportModeOptionMobile, value: "mobile" },
        { label: labels.viewportModeOptionTablet, value: "tablet" },
        { label: labels.viewportModeOptionDesktop, value: "desktop" },
    ], [
        labels.viewportModeOptionAuto,
        labels.viewportModeOptionMobile,
        labels.viewportModeOptionTablet,
        labels.viewportModeOptionDesktop,
    ]);

    return (
        <div
            data-component="DeviceIdentificationComponent"
            {...containerProps}
            className={twMerge("flex flex-col gap-4", containerProps.className)}
        >
            {Icon && (
                <div
                    {...iconWrapperProps}
                    className={twMerge(
                        "flex flex-col items-center",
                        iconWrapperProps.className
                    )}
                >
                    <Icon
                        {...iconProps}
                        className={twMerge(
                            "text-[80px] text-primary",
                            iconProps.className
                        )}
                    />
                    <h2
                        {...titleProps}
                        className={twMerge(
                            "text-app-xl font-app-semibold mt-2 text-center",
                            titleProps.className
                        )}
                    >
                        {labels.title}
                    </h2>
                </div>
            )}

            <p
                {...descriptionProps}
                className={twMerge("text-app-base text-center", descriptionProps.className)}
            >
                {hasDeviceOptions ? labels.devicesDescription : labels.noDevicesDescription}
            </p>

            <form
                onSubmit={handleSubmit}
                {...formProps}
                className={twMerge("flex flex-col gap-4", formProps.className)}
            >
                {hasDeviceOptions && (
                    <Checker
                        id="device-identification-checker"
                        name="uuid"
                        type="radio"
                        label={labels.devicesCheckerLabel}
                        options={checkerOptions}
                        value={uuid}
                        onChange={handleDeviceChange}
                        readOnly={isSubmitting}
                        required
                        {...devicesCheckerProps}
                    />
                )}

                {isCreatingNewDevice && (
                    <Input
                        id="device-identification-label"
                        name="label"
                        type="text"
                        label={labels.newDeviceInputLabel}
                        help={labels.newDeviceInputHelp}
                        placeholder={labels.newDeviceInputPlaceholder}
                        value={label}
                        onChange={setLabel}
                        readOnly={isSubmitting}
                        required
                        maxLength={128}
                        {...labelInputProps}
                    />
                )}

                {enableViewportMode && isCreatingNewDevice && (
                    <Checker
                        id="device-identification-viewport-mode"
                        name="viewport_mode"
                        type="radio"
                        label={labels.viewportModeLabel}
                        help={labels.viewportModeHelp}
                        options={viewportModeOptions}
                        value={viewportMode}
                        onChange={setViewportMode}
                        readOnly={isSubmitting}
                        required
                        {...viewportModeCheckerProps}
                    />
                )}

                {submitError && (
                    <p
                        role="alert"
                        {...errorAlertProps}
                        className={twMerge(
                            "text-red-600 text-sm",
                            errorAlertProps.className
                        )}
                    >
                        {submitError}
                    </p>
                )}

                <Button
                    type="submit"
                    label={labels.submitLabel}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    {...submitButtonProps}
                />
            </form>
        </div>
    );
};

DeviceIdentificationComponent.propTypes = propTypes;
DeviceIdentificationComponent.defaultProps = defaultProps;
