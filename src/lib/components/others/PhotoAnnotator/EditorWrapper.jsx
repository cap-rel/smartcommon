import { useEffect } from "react";
import { FormContext } from "lib/components";
import { twMerge } from "lib/utils";
import { useDialog } from "lib/hooks/local/useDialog";

// Hosts a type-specific renderEditor inside a fullscreen overlay. The editor
// receives `onSave(partial)` and `onCancel()`. `partial` is shallow-merged
// onto the current annotation: the type owns its payload shape.
//
// The editor is rendered under a null FormContext: an annotator is often
// placed inside the host page's <Form>, and an editor field with a `name`
// would otherwise bind itself to that form, writing its input into the host
// values (a `description` note overwrote the host's own `description`) and
// disabling the editor buttons while the host submits.
export const EditorWrapper = ({
    annotation,
    typeDef,
    onSave,
    onCancel,
    overlayProps = {},
}) => {
    const isHeadless = !!typeDef?.headlessEditor;

    // The overlay editor is a modal dialog: Tab kept inside, and Escape
    // cancels unless something inside already handled it (a list closing).
    const { dialogRef, onKeyDown } = useDialog({ isOpen: !!annotation && !!typeDef && !isHeadless, onClose: onCancel });

    // A headless editor has no dialog of its own: Escape still cancels it.
    useEffect(() => {
        if (!isHeadless) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape" && !e.defaultPrevented) onCancel?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isHeadless, onCancel]);

    if (!annotation || !typeDef) return null;

    // Headless editor: render the type's component as-is, no overlay or
    // modal chrome. The component is expected to call onSave / onCancel
    // from its own lifecycle (e.g. open a file input then save).
    if (typeDef.headlessEditor) {
        return (
            <FormContext.Provider value={null}>
                {typeDef.renderEditor(annotation, {
                    onSave,
                    onCancel,
                    typeDef,
                })}
            </FormContext.Provider>
        );
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
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={typeDef.label}
                tabIndex={-1}
                onKeyDown={onKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="outline-none relative bg-medium-bg w-full sm:max-w-lg sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <FormContext.Provider value={null}>
                    {typeDef.renderEditor(annotation, {
                        onSave,
                        onCancel,
                        typeDef,
                    })}
                </FormContext.Provider>
            </div>
        </div>
    );
};
