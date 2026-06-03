import { usePushNotifications } from "lib/hooks";
import { twMerge } from "lib/utils";

import { defaultProps, propTypes, DEFAULT_LABELS } from "./props";

/**
 * NotificationToggle
 *
 * Self-contained enable/disable control for Web Push notifications, backed by
 * usePushNotifications. Renders the appropriate UI for each permission state:
 *   - 'unsupported' / 'denied' -> an informative message (no toggle)
 *   - 'default' / 'granted'    -> a checkbox toggling the subscription
 *
 * i18n via the `labels` prop (DEFAULT_LABELS are English, source of truth).
 * Errors raised by the hook are surfaced verbatim under the toggle.
 */
export const NotificationToggle = (props) => {
    const { label, labels: userLabels = {}, containerProps = {}, className } = props;
    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const { permission, isSubscribed, isLoading, error, subscribe, unsubscribe } =
        usePushNotifications();

    const { className: containerClassName, ...restContainerProps } = containerProps;
    const rootClassName = twMerge("flex flex-col gap-1", className, containerClassName);

    if (permission === "unsupported") {
        return (
            <div data-component="NotificationToggle" className={rootClassName} {...restContainerProps}>
                <span className="text-gray-500">{labels.unsupported}</span>
            </div>
        );
    }

    if (permission === "denied") {
        return (
            <div data-component="NotificationToggle" className={rootClassName} {...restContainerProps}>
                <span className="text-gray-600">{labels.denied}</span>
                <small className="text-gray-400">{labels.deniedHint}</small>
            </div>
        );
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe(label);
        }
    };

    return (
        <div data-component="NotificationToggle" className={rootClassName} {...restContainerProps}>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSubscribed}
                    onChange={handleToggle}
                    disabled={isLoading}
                    className="h-4 w-4"
                />
                <span className={isLoading ? "text-gray-400" : "text-gray-700"}>
                    {labels.toggleLabel}
                </span>
            </label>
            {error && <small className="text-red-500">{error}</small>}
        </div>
    );
};

NotificationToggle.propTypes = propTypes;
NotificationToggle.defaultProps = defaultProps;
