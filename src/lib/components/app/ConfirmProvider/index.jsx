import { useState, useCallback } from "react";
import { FaTriangleExclamation, FaTrashCan, FaCircleQuestion, FaCircleInfo } from "react-icons/fa6";

import { Overlay } from "lib/components";

import { ConfirmContext } from "./context";

const ICONS = {
    danger: { icon: FaTrashCan, bgClass: "bg-red-100", iconClass: "text-red-500" },
    delete: { icon: FaTrashCan, bgClass: "bg-red-100", iconClass: "text-red-500" },
    warning: { icon: FaTriangleExclamation, bgClass: "bg-orange-100", iconClass: "text-orange-500" },
    info: { icon: FaCircleInfo, bgClass: "bg-blue-100", iconClass: "text-blue-500" },
};

const CONFIRM_BUTTON_CLASSES = {
    danger: "bg-red-500 text-white hover:bg-red-600",
    delete: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-orange-500 text-white hover:bg-orange-600",
};

const DEFAULT_CONFIRM_CLASS = "bg-blue-600 text-white hover:bg-blue-700";

export const ConfirmProvider = ({ children, labels }) => {
    const [state, setState] = useState(null);

    const defaultLabels = {
        cancel: labels?.cancel ?? "Cancel",
        confirm: labels?.confirm ?? "OK",
        ...labels,
    };

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setState({
                ...options,
                onConfirm: () => { setState(null); resolve(true); },
                onCancel: () => { setState(null); resolve(false); },
            });
        });
    }, []);

    const alert = useCallback((options) => {
        return new Promise((resolve) => {
            setState({
                ...options,
                isAlert: true,
                onConfirm: () => { setState(null); resolve(true); },
                onCancel: () => { setState(null); resolve(true); },
            });
        });
    }, []);

    const iconConfig = ICONS[state?.type] || { icon: FaCircleQuestion, bgClass: "bg-gray-100", iconClass: "text-gray-500" };
    const IconComponent = iconConfig.icon;
    const confirmBtnClass = CONFIRM_BUTTON_CLASSES[state?.type] || DEFAULT_CONFIRM_CLASS;

    return (
        <ConfirmContext.Provider value={{ confirm, alert }}>
            {children}

            {state && (
                <>
                    <Overlay
                        isOpen={true}
                        zIndex={100}
                        close={!state.isAlert ? state.onCancel : undefined}
                    />
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl pointer-events-auto">
                            <div className="flex flex-col items-center text-center mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.bgClass}`}>
                                    <IconComponent className={`text-xl ${iconConfig.iconClass}`} />
                                </div>
                                {state.title && (
                                    <h3 className="font-semibold text-gray-900 mt-3 text-lg">
                                        {state.title}
                                    </h3>
                                )}
                            </div>

                            <p className="text-gray-600 text-center mb-6">
                                {state.message}
                            </p>

                            {state.detail && (
                                <p className="text-sm text-gray-500 text-center mb-6 truncate px-4 py-2 bg-gray-50 rounded-lg">
                                    {state.detail}
                                </p>
                            )}

                            <div className="flex gap-3">
                                {!state.isAlert && (
                                    <button
                                        onClick={state.onCancel}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {state.cancelText || defaultLabels.cancel}
                                    </button>
                                )}
                                <button
                                    onClick={state.onConfirm}
                                    className={`flex-1 py-2.5 px-4 rounded-lg transition-colors ${confirmBtnClass}`}
                                >
                                    {state.confirmText || defaultLabels.confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </ConfirmContext.Provider>
    );
};
