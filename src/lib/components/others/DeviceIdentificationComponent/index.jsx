import { useState, useEffect, useRef, useCallback } from "react";
import { isEmpty } from "lodash";
import { MdDevices } from "react-icons/md";

import { useApi } from "lib/hooks";
import { Input, Button, Checker } from "lib/components";
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
        containerProps = {},
        formProps = {},
        iconWrapperProps = {},
        iconProps = {},
        titleProps = {},
        descriptionProps = {},
        devicesCheckerProps = {},
        labelInputProps = {},
        submitButtonProps = {},
        errorAlertProps = {},
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };
    const resolvedTimeoutMs = identifyTimeoutMs ?? abortTimeoutMs;

    const api = useApi();
    const deviceOptions = api?.user?.deviceOptions;
    const hasDeviceOptions = !isEmpty(deviceOptions);

    const [label, setLabel] = useState("");
    const [uuid, setUuid] = useState("");
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

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!api?.identifyDevice) return;

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const data = await api.identifyDevice(
                { label, uuid },
                { signal: AbortSignal.timeout(resolvedTimeoutMs) }
            );
            onSuccessRef.current?.(data);
        } catch (err) {
            const message = getErrorLabel?.(err) ?? labels.identifyError;
            setSubmitError(message);
            onErrorRef.current?.(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [api, label, uuid, resolvedTimeoutMs, getErrorLabel, labels.identifyError]);

    const checkerOptions = hasDeviceOptions
        ? [
            ...deviceOptions.map((opt) => ({ label: opt.label, value: opt.uuid })),
            { label: labels.noDeviceLabel, value: noDeviceValue },
        ]
        : [];

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
