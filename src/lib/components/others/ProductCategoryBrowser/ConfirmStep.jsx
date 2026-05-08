import { useEffect, useState } from "react";
import { FaBox, FaMinus, FaPlus } from "react-icons/fa6";
import { Button } from "lib/components";
import { twMerge } from "lib/utils";

import { buildDefaultPriceLabel } from "./props";

const useObjectUrl = (blob) => {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!blob) { setUrl(null); return undefined; }
        const u = URL.createObjectURL(blob);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [blob]);
    return url;
};

export const ConfirmStep = ({
    product,
    mode,
    defaultQty,
    defaultDiscountPercent,
    customerContext,
    getProductPriceDisplay,
    onConfirm,
    onBack,
    confirmLabelText,
    labels,
    confirmButtonProps = {},
    cancelButtonProps = {},
    ...rest
}) => {
    const [qty, setQty] = useState(defaultQty);
    const [discountPercent, setDiscountPercent] = useState(defaultDiscountPercent);

    useEffect(() => {
        setQty(defaultQty);
        setDiscountPercent(defaultDiscountPercent);
    }, [product?.id, defaultQty, defaultDiscountPercent]);

    const blobUrl = useObjectUrl(product?.image?.blob);
    const imageUrl = blobUrl || product?.image?.url || null;

    const display = getProductPriceDisplay?.(product, customerContext);
    const priceLabel = buildDefaultPriceLabel(display);
    const unitPrice = display?.displayPrice ?? display?.unitPrice ?? null;

    const parsedQty = parseFloat(qty) || 1;
    const parsedDiscount = parseFloat(discountPercent) || 0;
    const computedTotal = unitPrice != null
        ? unitPrice * parsedQty * (1 - parsedDiscount / 100)
        : null;

    const totalLabel = computedTotal != null
        ? `${computedTotal.toFixed(2)}${display?.currency ? " " + display.currency : ""}${display?.ttc ? " TTC" : display?.ttc === false ? " HT" : ""}`
        : null;

    const handleConfirm = () => {
        const payload = { product, qty: parsedQty };
        if (mode === "quantity-discount") {
            payload.discountPercent = parsedDiscount;
        }
        if (computedTotal != null) {
            payload.computedTotal = computedTotal;
        }
        onConfirm(payload);
    };

    const showDiscount = mode === "quantity-discount";

    return (
        <div
            {...rest}
            className={twMerge("flex-1 flex flex-col min-h-0 overflow-y-auto", rest.className)}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-4">
                <div className="size-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product?.label || ""} className="w-full h-full object-cover" />
                    ) : (
                        <FaBox className="text-3xl text-gray-300" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {product?.label || ""}
                    </div>
                    {product?.ref && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                            {product.ref}
                        </div>
                    )}
                    {priceLabel && (
                        <div className="text-base font-bold text-primary mt-1">{priceLabel}</div>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        {labels.quantity}
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setQty(Math.max(0.01, parsedQty - 1))}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-600 active:scale-95 transition-all"
                        >
                            <FaMinus />
                        </button>
                        <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            min="0.01"
                            step="0.01"
                            className="w-24 text-center text-lg font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5"
                        />
                        <button
                            type="button"
                            onClick={() => setQty(parsedQty + 1)}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-600 active:scale-95 transition-all"
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>

                {showDiscount && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            {labels.discount} (%)
                        </label>
                        <input
                            type="number"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-24 text-center text-lg font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5"
                        />
                    </div>
                )}

                {totalLabel && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{labels.totalHT}</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{totalLabel}</span>
                    </div>
                )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                    type="button"
                    onClick={onBack}
                    {...cancelButtonProps}
                    className={twMerge(
                        "flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
                        cancelButtonProps.className
                    )}
                >
                    {labels.changeProductLabel}
                </button>
                <Button
                    label={confirmLabelText}
                    onClick={handleConfirm}
                    {...confirmButtonProps}
                    buttonProps={{
                        className: twMerge(
                            "flex-1 text-white px-4 py-3 rounded-xl text-sm font-semibold bg-primary hover:opacity-90 transition-opacity",
                            confirmButtonProps?.buttonProps?.className
                        ),
                        ...(confirmButtonProps.buttonProps || {}),
                    }}
                />
            </div>
        </div>
    );
};
