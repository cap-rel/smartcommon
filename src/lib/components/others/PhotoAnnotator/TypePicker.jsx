import { twMerge } from "lib/utils";

export const TypePicker = ({
    annotationTypes,
    onPick,
    onCancel,
    labels,
    pickerProps = {},
}) => {
    const types = Object.entries(annotationTypes);

    return (
        <div
            {...pickerProps}
            className={twMerge(
                "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50",
                pickerProps.className
            )}
            onClick={onCancel}
        >
            <div
                role="dialog"
                onClick={(e) => e.stopPropagation()}
                className="relative bg-medium-bg rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md mx-0 sm:mx-4 max-h-[80vh] flex flex-col"
            >
                <div className="p-4 border-b border-border">
                    <h3 className="text-base font-semibold text-strong-text">
                        {labels.chooseType}
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto">
                    {types.map(([typeKey, def]) => (
                        <button
                            key={typeKey}
                            type="button"
                            onClick={() => onPick(typeKey)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-strong-bg hover:brightness-soft active:scale-95 transition-all"
                        >
                            <div
                                className="size-12 flex items-center justify-center rounded-full text-white text-xl"
                                style={{ backgroundColor: def.color || "#6B7280" }}
                            >
                                {def.icon}
                            </div>
                            <span className="text-xs font-medium text-strong-text text-center line-clamp-2">
                                {def.label}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-strong-text bg-strong-bg hover:brightness-soft"
                    >
                        {labels.pickerCancel}
                    </button>
                </div>
            </div>
        </div>
    );
};
