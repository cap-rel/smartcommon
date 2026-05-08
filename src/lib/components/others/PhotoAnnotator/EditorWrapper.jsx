import { useEffect } from "react";
import { twMerge } from "lib/utils";

// Hosts a type-specific renderEditor inside a fullscreen overlay. The editor
// receives `onSave(partial)` and `onCancel()`. `partial` is shallow-merged
// onto the current annotation: the type owns its payload shape.
export const EditorWrapper = ({
    annotation,
    typeDef,
    onSave,
    onCancel,
    overlayProps = {},
}) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onCancel?.(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onCancel]);

    if (!annotation || !typeDef) return null;

    // Headless editor: render the type's component as-is, no overlay or
    // modal chrome. The component is expected to call onSave / onCancel
    // from its own lifecycle (e.g. open a file input then save).
    if (typeDef.headlessEditor) {
        return typeDef.renderEditor(annotation, {
            onSave,
            onCancel,
            typeDef,
        });
    }

    return (
        <div
            {...overlayProps}
            className={twMerge(
                "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4",
                overlayProps.className
            )}
            onClick={onCancel}
        >
            <div
                role="dialog"
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {typeDef.renderEditor(annotation, {
                    onSave,
                    onCancel,
                    typeDef,
                })}
            </div>
        </div>
    );
};
