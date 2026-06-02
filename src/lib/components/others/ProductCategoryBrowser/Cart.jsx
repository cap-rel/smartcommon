import { FaXmark } from "react-icons/fa6";
import { Button } from "lib/components";
import { twMerge } from "lib/utils";

const formatTotal = (total, currency, ttc) => {
    if (total == null) return null;
    const suffix = ttc ? " TTC" : ttc === false ? " HT" : "";
    return `${total.toFixed(2)}${currency ? " " + currency : ""}${suffix}`;
};

export const Cart = ({
    items,
    mode,
    onRemove,
    onEdit,
    onValidate,
    labels,
    confirmButtonProps = {},
    ...rest
}) => {
    const count = items.length;
    if (count === 0) return null;

    let total = null;
    let currency = null;
    let ttc = null;
    if (mode === "quantity-discount" || mode === "quantity") {
        total = items.reduce((acc, it) => {
            if (it.computedTotal != null) {
                if (currency == null) currency = it.product?.__display?.currency;
                if (ttc == null) ttc = it.product?.__display?.ttc;
                return acc + it.computedTotal;
            }
            return acc;
        }, 0);
        if (total === 0 && !items.some((it) => it.computedTotal != null)) {
            total = null;
        }
    }
    const totalLabel = formatTotal(total, currency, ttc);
    const validateText = totalLabel
        ? `${labels.validateLabel} (${count}) - ${totalLabel}`
        : `${labels.validateLabel} (${count})`;

    return (
        <div
            {...rest}
            className={twMerge(
                "flex-shrink-0 border-t border-border bg-medium-bg",
                rest.className
            )}
        >
            <div className="max-h-32 overflow-y-auto px-4 py-2 flex flex-col gap-1">
                {items.map((it, idx) => {
                    const productKey = it.product?.id ?? idx;
                    const qtyLabel = it.qty != null ? `× ${it.qty}` : "";
                    const lineTotal = formatTotal(it.computedTotal, it.product?.__display?.currency, it.product?.__display?.ttc);
                    return (
                        <div
                            key={productKey}
                            className="flex items-center gap-2 text-sm py-1"
                        >
                            <button
                                type="button"
                                onClick={() => onEdit?.(it, idx)}
                                className="flex-1 flex items-center gap-2 min-w-0 text-left hover:bg-strong-bg rounded px-1 py-0.5"
                            >
                                <span className="font-medium text-strong-text truncate">
                                    {it.product?.label || it.product?.ref || ""}
                                </span>
                                {qtyLabel && (
                                    <span className="text-medium-text flex-shrink-0">{qtyLabel}</span>
                                )}
                                {lineTotal && (
                                    <span className="ml-auto text-strong-text font-semibold flex-shrink-0">{lineTotal}</span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                aria-label={labels.removeLabel}
                                className="p-1 text-soft-text hover:text-error"
                            >
                                <FaXmark />
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="p-3 border-t border-border">
                <Button
                    label={validateText}
                    onClick={onValidate}
                    {...confirmButtonProps}
                    buttonProps={{
                        className: twMerge(
                            "w-full text-white px-4 py-3 rounded-xl text-sm font-semibold bg-primary hover:opacity-90 transition-opacity",
                            confirmButtonProps?.buttonProps?.className
                        ),
                        ...(confirmButtonProps.buttonProps || {}),
                    }}
                />
            </div>
        </div>
    );
};
