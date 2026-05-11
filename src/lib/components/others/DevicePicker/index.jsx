import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MdSmartphone, MdTablet, MdLaptop, MdDesktopWindows } from "react-icons/md";

import { Input, Button, Select } from "lib/components";
import { twMerge } from "lib/utils";

import {
    DEFAULT_LABELS,
    DEFAULT_DEVICE_ICON,
    DEVICE_LABEL_MAX_LENGTH,
    SUPPORTED_DEVICE_ICONS,
    defaultProps,
    formatSessionCount,
    normaliseDeviceIcon,
    propTypes,
} from "./props";

// Map of icon key -> react-icons component.
// Kept inside the file so consumers don't have to wire it; we still
// fall back to the "phone" entry if a malformed key is sent by the
// backend.
const ICON_COMPONENTS = {
    phone: MdSmartphone,
    tablet: MdTablet,
    laptop: MdLaptop,
    desktop: MdDesktopWindows,
};

const renderDeviceIcon = (icon, className) => {
    const key = normaliseDeviceIcon(icon);
    const IconCmp = ICON_COMPONENTS[key] ?? ICON_COMPONENTS[DEFAULT_DEVICE_ICON];
    return <IconCmp className={className} />;
};

// Formats a date_lastseen value into a short display string. The
// backend sends "YYYY-MM-DD HH:MM:SS" UTC-ish strings; we display the
// user-local date because we don't ship a date library here and the
// exact timezone is not load-bearing for the picker (the consumer's
// own admin pages handle the precise rendering).
const formatLastSeen = (raw) => {
    if (!raw) return null;
    // Accept both "YYYY-MM-DD HH:MM:SS" (Dolibarr style) and ISO 8601.
    const isoCandidate = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(isoCandidate);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString();
};

export const DevicePicker = (props) => {
    const {
        existingDevices = [],
        onPick,
        onCreate,
        onCancel,
        loading: externalLoading = false,
        error: externalError,
        containerProps = {},
        titleProps = {},
        descriptionProps = {},
        listProps = {},
        itemProps = {},
        newDeviceButtonProps = {},
        formProps = {},
        labelInputProps = {},
        iconSelectProps = {},
        submitButtonProps = {},
        cancelButtonProps = {},
        errorAlertProps = {},
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const hasExistingDevices = existingDevices.length > 0;

    // Two display modes:
    //   "list" - user picks an existing logical device.
    //   "form" - user fills label + icon to create a new one.
    // When the user has zero existing devices we start directly on
    // "form" since there's nothing to pick.
    const [mode, setMode] = useState(hasExistingDevices ? "list" : "form");
    const [label, setLabel] = useState("");
    const [icon, setIcon] = useState(DEFAULT_DEVICE_ICON);
    const [localSubmitting, setLocalSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    // If `existingDevices` becomes empty (parent re-fetched and got
    // nothing back) while we're still on the list, fall back to the
    // form. We don't auto-switch the other way around: once the user
    // is on the form, we let them finish.
    useEffect(() => {
        if (!hasExistingDevices && mode === "list") {
            setMode("form");
        }
    }, [hasExistingDevices, mode]);

    // External error always wins over the locally derived one: the
    // parent owns the source of truth for the error message displayed
    // to the user. The local one is only used for client-side
    // validation that the parent has no way to know about.
    const errorToDisplay = externalError ?? localError;

    const onPickRef = useRef(onPick);
    const onCreateRef = useRef(onCreate);
    useEffect(() => { onPickRef.current = onPick; }, [onPick]);
    useEffect(() => { onCreateRef.current = onCreate; }, [onCreate]);

    const isLocked = externalLoading || localSubmitting;

    const iconOptions = useMemo(() => [
        { value: "phone", label: labels.iconPhone },
        { value: "tablet", label: labels.iconTablet },
        { value: "laptop", label: labels.iconLaptop },
        { value: "desktop", label: labels.iconDesktop },
    ], [labels.iconPhone, labels.iconTablet, labels.iconLaptop, labels.iconDesktop]);

    const handlePick = useCallback(async (deviceId) => {
        if (isLocked) return;
        setLocalError(null);
        setLocalSubmitting(true);
        try {
            await onPickRef.current?.(deviceId);
        } catch {
            // Parent owns the error message. We don't blank out the
            // external error because the parent will set it via the
            // `error` prop. We only flag that we're no longer busy.
        } finally {
            setLocalSubmitting(false);
        }
    }, [isLocked]);

    const handleCreateSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (isLocked) return;

        const trimmed = label.trim();
        if (trimmed.length === 0) {
            setLocalError(labels.validationLabelRequired);
            return;
        }
        if (trimmed.length > DEVICE_LABEL_MAX_LENGTH) {
            setLocalError(labels.validationLabelTooLong);
            return;
        }

        const safeIcon = SUPPORTED_DEVICE_ICONS.includes(icon)
            ? icon
            : DEFAULT_DEVICE_ICON;

        setLocalError(null);
        setLocalSubmitting(true);
        try {
            await onCreateRef.current?.(trimmed, safeIcon);
        } catch {
            // See handlePick comment.
        } finally {
            setLocalSubmitting(false);
        }
    }, [
        isLocked,
        label,
        icon,
        labels.validationLabelRequired,
        labels.validationLabelTooLong,
    ]);

    const switchToForm = () => {
        if (isLocked) return;
        setLocalError(null);
        setMode("form");
    };

    const switchToList = () => {
        if (isLocked) return;
        setLocalError(null);
        setMode("list");
    };

    return (
        <div
            data-component="DevicePicker"
            {...containerProps}
            className={twMerge("flex flex-col gap-4", containerProps.className)}
        >
            <h2
                {...titleProps}
                className={twMerge(
                    "text-app-xl font-app-semibold text-center",
                    titleProps.className
                )}
            >
                {labels.title}
            </h2>

            <p
                {...descriptionProps}
                className={twMerge(
                    "text-app-base text-center",
                    descriptionProps.className
                )}
            >
                {hasExistingDevices && mode === "list"
                    ? labels.descriptionWithDevices
                    : labels.descriptionEmpty}
            </p>

            {errorToDisplay && (
                <p
                    role="alert"
                    {...errorAlertProps}
                    className={twMerge(
                        "text-red-600 text-sm text-center",
                        errorAlertProps.className
                    )}
                >
                    {errorToDisplay}
                </p>
            )}

            {mode === "list" && hasExistingDevices && (
                <>
                    <ul
                        {...listProps}
                        className={twMerge("flex flex-col gap-2", listProps.className)}
                    >
                        {existingDevices.map((device) => {
                            const lastSeen = formatLastSeen(device.date_lastseen);
                            return (
                                <li key={device.id}>
                                    <button
                                        type="button"
                                        onClick={() => handlePick(device.id)}
                                        disabled={isLocked}
                                        data-device-id={device.id}
                                        {...itemProps}
                                        className={twMerge(
                                            "flex items-center gap-3 w-full p-app-md " +
                                            "rounded-app-md border border-border bg-soft-bg " +
                                            "text-left hover:brightness-soft " +
                                            "disabled:opacity-60 disabled:cursor-not-allowed " +
                                            "cursor-pointer transition-all",
                                            itemProps.className
                                        )}
                                    >
                                        {renderDeviceIcon(
                                            device.icon,
                                            "text-3xl text-primary shrink-0"
                                        )}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-app-semibold truncate">
                                                {device.label}
                                            </span>
                                            <span className="text-app-sm text-soft-text">
                                                {formatSessionCount(device.session_count, labels)}
                                            </span>
                                            {lastSeen && (
                                                <span className="text-app-xs text-soft-text">
                                                    {labels.lastSeenPrefix} {lastSeen}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        type="button"
                        onClick={switchToForm}
                        disabled={isLocked}
                        {...newDeviceButtonProps}
                        className={twMerge(
                            "flex items-center justify-center gap-2 w-full py-3 px-4 " +
                            "rounded-app-md border border-dashed border-border " +
                            "bg-soft-bg hover:brightness-soft font-app-medium " +
                            "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
                            newDeviceButtonProps.className
                        )}
                    >
                        {labels.newDeviceButton}
                    </button>

                    {onCancel && (
                        <Button
                            type="button"
                            label={labels.cancel}
                            disabled={isLocked}
                            onClick={onCancel}
                            {...cancelButtonProps}
                        />
                    )}
                </>
            )}

            {mode === "form" && (
                <form
                    onSubmit={handleCreateSubmit}
                    {...formProps}
                    className={twMerge("flex flex-col gap-4", formProps.className)}
                >
                    <h3 className="text-app-lg font-app-semibold">
                        {labels.newDeviceTitle}
                    </h3>

                    <Input
                        id="device-picker-label"
                        name="label"
                        type="text"
                        label={labels.labelInputLabel}
                        help={labels.labelInputHelp}
                        placeholder={labels.labelInputPlaceholder}
                        value={label}
                        onChange={setLabel}
                        readOnly={isLocked}
                        required
                        maxLength={DEVICE_LABEL_MAX_LENGTH}
                        {...labelInputProps}
                    />

                    <Select
                        id="device-picker-icon"
                        name="icon"
                        label={labels.iconSelectLabel}
                        value={icon}
                        onChange={setIcon}
                        readOnly={isLocked}
                        options={iconOptions}
                        {...iconSelectProps}
                    />

                    <Button
                        type="submit"
                        label={labels.submitNew}
                        loading={localSubmitting}
                        disabled={isLocked}
                        {...submitButtonProps}
                    />

                    {hasExistingDevices && (
                        // "Back" link, only useful if there were existing
                        // devices to pick from in the first place.
                        <button
                            type="button"
                            onClick={switchToList}
                            disabled={isLocked}
                            className={twMerge(
                                "text-app-sm underline text-soft-text " +
                                "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            )}
                        >
                            {labels.cancel}
                        </button>
                    )}

                    {!hasExistingDevices && onCancel && (
                        <Button
                            type="button"
                            label={labels.cancel}
                            disabled={isLocked}
                            onClick={onCancel}
                            {...cancelButtonProps}
                        />
                    )}
                </form>
            )}
        </div>
    );
};

DevicePicker.propTypes = propTypes;
DevicePicker.defaultProps = defaultProps;
