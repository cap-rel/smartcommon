import { FaPen, FaTrash } from "react-icons/fa6";
import { twMerge } from "lib/utils";

const summarizePayload = (payload) => {
    if (!payload || typeof payload !== "object") return "";
    const str = JSON.stringify(payload);
    return str.length > 60 ? str.slice(0, 57) + "..." : str;
};

const DefaultListItem = ({ annotation, num, typeDef, labels }) => {
    const summary = summarizePayload(annotation.payload);
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div
                className="size-8 flex-shrink-0 flex items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ backgroundColor: typeDef.color || "#6B7280" }}
            >
                {num}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-strong-text truncate">
                    {typeDef.label}
                </div>
                <div className="text-xs text-medium-text truncate">
                    {summary || labels.untitled}
                </div>
            </div>
        </div>
    );
};

export const AnnotationList = ({
    annotations,
    annotationTypes,
    selectedId,
    readOnly,
    position,
    onSelect,
    onActivate,
    onEdit,
    onDelete,
    labels,
    listProps = {},
    listItemProps = {},
}) => {
    if (position === "off") return null;

    const isVertical = position === "right";

    if (annotations.length === 0) {
        return (
            <div
                {...listProps}
                className={twMerge(
                    "border-border bg-medium-bg flex items-center justify-center text-sm text-soft-text",
                    isVertical
                        ? "w-72 border-l p-4 flex-shrink-0"
                        : "border-t p-3",
                    listProps.className
                )}
            >
                {labels.listEmpty}
            </div>
        );
    }

    return (
        <div
            {...listProps}
            className={twMerge(
                "border-border bg-medium-bg overflow-y-auto",
                isVertical
                    ? "w-72 border-l flex-shrink-0"
                    : "border-t max-h-48",
                listProps.className
            )}
        >
            <ul className={twMerge("flex", isVertical ? "flex-col" : "flex-col sm:flex-col")}>
                {annotations.map((annotation, index) => {
                    const def = annotationTypes[annotation.type];
                    if (!def) return null;
                    const num = index + 1;
                    const selected = annotation.id === selectedId;
                    const ctx = { num, selected, readOnly, typeDef: def, labels };
                    const itemContent = def.renderListItem
                        ? def.renderListItem(annotation, ctx)
                        : <DefaultListItem annotation={annotation} num={num} typeDef={def} labels={labels} />;

                    return (
                        <li
                            key={annotation.id}
                            {...listItemProps}
                            className={twMerge(
                                "flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0 hover:bg-strong-bg",
                                selected && "bg-primary/10",
                                listItemProps.className
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => onSelect(annotation)}
                                onDoubleClick={() => onActivate?.(annotation)}
                                className="flex-1 min-w-0 text-left"
                            >
                                {itemContent}
                            </button>
                            {!readOnly && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(annotation)}
                                        aria-label={labels.edit}
                                        className="p-2 rounded-full text-medium-text hover:text-strong-text hover:bg-strong-bg"
                                    >
                                        <FaPen className="text-sm" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(annotation)}
                                        aria-label={labels.delete}
                                        className="p-2 rounded-full text-medium-text hover:text-error hover:bg-error/10"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
