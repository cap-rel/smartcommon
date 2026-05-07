import { useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import toast from "react-hot-toast";

import { Modal } from "lib/components";

import { defaultProps, propTypes, DEFAULT_LABELS } from "./props";

export const AboutModal = (props) => {
    const {
        open,
        onClose,
        appName,
        version,
        fields = [],
        labels: userLabels = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const [updateStatus, setUpdateStatus] = useState("idle");
    // 'idle' | 'checking' | 'available' | 'upToDate' | 'updating'

    const checkForUpdates = async () => {
        if (!("serviceWorker" in navigator)) {
            toast.error(labels.updatesNotSupported);
            return;
        }

        setUpdateStatus("checking");
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setUpdateStatus("upToDate");
                toast(labels.upToDate);
                return;
            }

            await registration.update();

            if (registration.waiting || registration.installing) {
                setUpdateStatus("available");
            } else {
                setUpdateStatus("upToDate");
                toast(labels.upToDate);
            }
        } catch (err) {
            console.error("[AboutModal] Error checking for updates:", err);
            setUpdateStatus("idle");
            toast.error(labels.checkError);
        }
    };

    const applyUpdate = () => {
        setUpdateStatus("updating");
        window.location.reload();
    };

    const handleClose = () => {
        setUpdateStatus("idle");
        onClose?.();
    };

    const buttonLabel = updateStatus === "checking" ? labels.checking
        : updateStatus === "upToDate" ? labels.upToDate
        : updateStatus === "updating" ? labels.updating
        : labels.checkUpdates;

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title={labels.title}
            size="sm"
        >
            <div data-component="AboutModal" className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-gray-600">
                    <Row label={labels.application} value={appName} />
                    <Row label={labels.version} value={version || "-"} />
                    {fields.map((field, index) => (
                        <Row key={index} label={field.label} value={field.value} />
                    ))}
                </div>

                <div className="pt-3 border-t border-gray-200">
                    {updateStatus === "available" ? (
                        <button
                            type="button"
                            onClick={applyUpdate}
                            className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                            <FaArrowsRotate />
                            {labels.installUpdate}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={checkForUpdates}
                            disabled={updateStatus === "checking" || updateStatus === "updating"}
                            className="w-full py-2 px-4 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <FaArrowsRotate className={updateStatus === "checking" ? "animate-spin" : ""} />
                            {buttonLabel}
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    {labels.close}
                </button>
            </div>
        </Modal>
    );
};

AboutModal.propTypes = propTypes;
AboutModal.defaultProps = defaultProps;

const Row = ({ label, value }) => (
    <div className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="font-medium text-gray-800 text-right truncate">{value}</span>
    </div>
);
