import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { twMerge } from "lib/utils";

import {
    ALL_PRODUCTS_ID,
    UNCATEGORIZED_ID,
    DEFAULT_LABELS,
    defaultProps,
    propTypes,
} from "./props";
import { Breadcrumb } from "./Breadcrumb";
import { CategoryGrid } from "./CategoryGrid";
import { ProductGrid } from "./ProductGrid";
import { ConfirmStep } from "./ConfirmStep";
import { Cart } from "./Cart";

const SEARCH_DEBOUNCE_MS = 300;

export const ProductCategoryBrowser = (props) => {
    const {
        open,
        onClose,
        mode = "select",
        multiple = false,

        productsAdapter,
        categoriesAdapter,
        productType,

        customerContext,
        getProductPriceDisplay,
        renderItem,

        defaultQty = 1,
        defaultDiscountPercent = 0,

        // When provided in mode "quantity" / "quantity-discount", the browser
        // opens directly on the confirm step with this product preselected.
        // Used by callers that edit an existing line (annotation, cart row).
        prefillProduct,

        showAllProductsTile = true,
        showUncategorizedTile = true,

        onSelect,

        labels: userLabels = {},

        containerProps = {},
        headerProps = {},
        titleProps = {},
        breadcrumbProps = {},
        searchInputProps = {},
        categoryGridProps = {},
        productGridProps = {},
        confirmStepProps = {},
        cartProps = {},
        confirmButtonProps = {},
        cancelButtonProps = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const [step, setStep] = useState("browse");
    const [parentId, setParentId] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);

    // Reset internal state every time the modal opens, so a previous run does
    // not leak into the next one. If prefillProduct is provided in a quantity
    // mode, jump straight to the confirm step (edit-an-existing-line flow).
    useEffect(() => {
        if (!open) return;
        setParentId(null);
        setCategoryPath([]);
        setSearchInput("");
        setSearchDebounced("");
        setCart([]);
        const canPrefill = prefillProduct
            && (mode === "quantity" || mode === "quantity-discount");
        if (canPrefill) {
            setStep("confirm");
            setSelectedProduct(prefillProduct);
        } else {
            setStep("browse");
            setSelectedProduct(null);
        }
    }, [open, prefillProduct, mode]);

    // Body scroll lock + escape key.
    useEffect(() => {
        if (!open) return undefined;
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    // Debounce search input.
    const debounceRef = useRef(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchDebounced(searchInput.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchInput]);

    // Resolve subcategories for the current parent: drives the choice between
    // CategoryGrid and ProductGrid in the browse view. Skipped when in
    // search mode or on a special tile.
    const inSearchMode = Boolean(searchDebounced);
    const isSpecialTile = parentId === ALL_PRODUCTS_ID || parentId === UNCATEGORIZED_ID;

    useEffect(() => {
        if (!open || inSearchMode || isSpecialTile) {
            setSubCategories([]);
            return undefined;
        }
        let cancelled = false;
        setSubLoading(true);
        const fetcher = parentId === null
            ? categoriesAdapter.getRoots(productType)
            : categoriesAdapter.getChildren(parentId);
        Promise.resolve(fetcher)
            .then((items) => { if (!cancelled) setSubCategories(items || []); })
            .catch((err) => {
                console.error("ProductCategoryBrowser: failed to load categories", err);
                if (!cancelled) setSubCategories([]);
            })
            .finally(() => { if (!cancelled) setSubLoading(false); });
        return () => { cancelled = true; };
    }, [open, parentId, productType, categoriesAdapter, inSearchMode, isSpecialTile]);

    // Navigation handlers.
    const navigateInto = useCallback((id, label) => {
        if (id === ALL_PRODUCTS_ID || id === UNCATEGORIZED_ID) {
            setParentId(id);
            setCategoryPath((prev) => [...prev, { id, label }]);
            return;
        }
        setParentId(id);
        setCategoryPath((prev) => [...prev, { id, label }]);
    }, []);

    const navigateBack = useCallback(() => {
        setCategoryPath((prev) => {
            const next = prev.slice(0, -1);
            setParentId(next.length === 0 ? null : next[next.length - 1].id);
            return next;
        });
    }, []);

    const navigateRoot = useCallback(() => {
        setCategoryPath([]);
        setParentId(null);
    }, []);

    const navigateToCrumb = useCallback((item, index) => {
        setCategoryPath((prev) => prev.slice(0, index + 1));
        setParentId(item.id);
    }, []);

    // Product selection.
    const handleProductClick = useCallback((product) => {
        if (mode === "select") {
            if (multiple) {
                setCart((prev) => {
                    const exists = prev.findIndex((it) => it.product.id === product.id) >= 0;
                    if (exists) {
                        return prev.filter((it) => it.product.id !== product.id);
                    }
                    return [...prev, { product }];
                });
                return;
            }
            onSelect?.(product);
            onClose?.();
            return;
        }
        // mode "quantity" or "quantity-discount"
        setSelectedProduct(product);
        setStep("confirm");
    }, [mode, multiple, onSelect, onClose]);

    const handleConfirmFromStep = useCallback((payload) => {
        // Attach __display so the cart can format totals consistently.
        const display = getProductPriceDisplay?.(payload.product, customerContext);
        const productWithDisplay = display
            ? { ...payload.product, __display: display }
            : payload.product;
        const enriched = { ...payload, product: productWithDisplay };

        if (multiple) {
            setCart((prev) => [...prev, enriched]);
            setStep("browse");
            setSelectedProduct(null);
            return;
        }
        onSelect?.(enriched);
        onClose?.();
    }, [multiple, onSelect, onClose, getProductPriceDisplay, customerContext]);

    const handleCartRemove = useCallback((index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleCartValidate = useCallback(() => {
        // Strip the internal __display field before exposing.
        const cleaned = cart.map((it) => {
            const { __display, ...rest } = it.product || {};
            void __display;
            return { ...it, product: rest };
        });
        if (mode === "select") {
            onSelect?.(cleaned.map((it) => it.product));
        } else {
            onSelect?.(cleaned);
        }
        onClose?.();
    }, [cart, mode, onSelect, onClose]);

    // Handle the back-arrow in the header.
    const handleHeaderBack = useCallback(() => {
        if (step === "confirm") {
            setStep("browse");
            setSelectedProduct(null);
            return;
        }
        if (categoryPath.length > 0) {
            navigateBack();
            return;
        }
        onClose?.();
    }, [step, categoryPath.length, navigateBack, onClose]);

    // Cart selected ids for highlighting tiles in mode=select+multiple.
    const selectedIds = useMemo(() => {
        if (mode !== "select" || !multiple) return [];
        return cart.map((it) => it.product?.id).filter((id) => id != null);
    }, [cart, mode, multiple]);

    // Map of cart quantities for the badge in mode=quantity*+multiple.
    const cartQtyMap = useMemo(() => {
        if (mode === "select" || !multiple) return undefined;
        const m = new Map();
        cart.forEach((it) => {
            const id = it.product?.id;
            if (id == null) return;
            m.set(id, (m.get(id) || 0) + (parseFloat(it.qty) || 1));
        });
        return m;
    }, [cart, mode, multiple]);

    if (!open) return null;

    // Decide what to render in the browse step.
    let browseContent;
    if (inSearchMode) {
        browseContent = (
            <ProductGrid
                categoryId={undefined}
                search={searchDebounced}
                productsAdapter={productsAdapter}
                productType={productType}
                customerContext={customerContext}
                getProductPriceDisplay={getProductPriceDisplay}
                renderItem={renderItem}
                selectedIds={selectedIds}
                cartQtyMap={cartQtyMap}
                onProductClick={handleProductClick}
                labels={labels}
                {...productGridProps}
            />
        );
    } else if (parentId === ALL_PRODUCTS_ID) {
        browseContent = (
            <ProductGrid
                categoryId={undefined}
                search=""
                productsAdapter={productsAdapter}
                productType={productType}
                customerContext={customerContext}
                getProductPriceDisplay={getProductPriceDisplay}
                renderItem={renderItem}
                selectedIds={selectedIds}
                cartQtyMap={cartQtyMap}
                onProductClick={handleProductClick}
                labels={labels}
                {...productGridProps}
            />
        );
    } else if (parentId === UNCATEGORIZED_ID) {
        browseContent = (
            <ProductGrid
                categoryId={null}
                search=""
                productsAdapter={productsAdapter}
                productType={productType}
                customerContext={customerContext}
                getProductPriceDisplay={getProductPriceDisplay}
                renderItem={renderItem}
                selectedIds={selectedIds}
                cartQtyMap={cartQtyMap}
                onProductClick={handleProductClick}
                labels={labels}
                {...productGridProps}
            />
        );
    } else {
        const isRoot = parentId === null;
        const hasSubs = !subLoading && subCategories.length > 0;
        if (subLoading || hasSubs || (isRoot && (showAllProductsTile || showUncategorizedTile))) {
            browseContent = (
                <CategoryGrid
                    categories={subCategories}
                    loading={subLoading}
                    isRoot={isRoot}
                    onNavigate={navigateInto}
                    showAllProductsTile={showAllProductsTile}
                    showUncategorizedTile={showUncategorizedTile}
                    labels={labels}
                    {...categoryGridProps}
                />
            );
        } else {
            // Leaf category with no subcategories: show its products directly.
            browseContent = (
                <ProductGrid
                    categoryId={parentId}
                    search=""
                    productsAdapter={productsAdapter}
                    productType={productType}
                    customerContext={customerContext}
                    getProductPriceDisplay={getProductPriceDisplay}
                    renderItem={renderItem}
                    selectedIds={selectedIds}
                    cartQtyMap={cartQtyMap}
                    onProductClick={handleProductClick}
                    labels={labels}
                    {...productGridProps}
                />
            );
        }
    }

    const showCart = multiple && cart.length > 0 && step === "browse";
    const showSearchBar = step === "browse";
    const showBreadcrumb = step === "browse" && !inSearchMode && categoryPath.length > 0;

    return (
        <div
            data-component="ProductCategoryBrowser"
            {...containerProps}
            className={twMerge(
                "fixed inset-0 z-50 flex flex-col bg-soft-bg",
                containerProps.className
            )}
        >
            <header
                {...headerProps}
                className={twMerge(
                    "h-14 flex-shrink-0 flex items-center gap-3 px-4 bg-medium-bg border-b border-border",
                    headerProps.className
                )}
            >
                <button
                    type="button"
                    onClick={handleHeaderBack}
                    className="p-2 rounded-full hover:bg-strong-bg"
                >
                    <FaArrowLeft className="text-lg text-strong-text" />
                </button>
                <h2
                    {...titleProps}
                    className={twMerge(
                        "text-base font-semibold text-strong-text flex-1",
                        titleProps.className
                    )}
                >
                    {step === "confirm" ? labels.confirmTitle : labels.title}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-strong-bg"
                >
                    <FaXmark className="text-lg text-medium-text" />
                </button>
            </header>

            {showSearchBar && (
                <div className="px-4 pt-3 pb-1 flex-shrink-0">
                    <div className="relative">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-text text-sm" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={labels.searchPlaceholder}
                            {...searchInputProps}
                            className={twMerge(
                                "w-full pl-9 pr-9 py-2 rounded-xl bg-strong-bg text-strong-text placeholder-soft-text outline-none border border-border text-sm",
                                searchInputProps.className
                            )}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-text hover:text-medium-text"
                            >
                                <FaXmark className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showBreadcrumb && (
                <Breadcrumb
                    path={categoryPath}
                    rootLabel={labels.allCategoriesCrumb}
                    onNavigateRoot={navigateRoot}
                    onNavigateTo={navigateToCrumb}
                    {...breadcrumbProps}
                />
            )}

            {step === "browse" ? (
                <div className="flex-1 flex flex-col min-h-0">{browseContent}</div>
            ) : (
                <ConfirmStep
                    product={selectedProduct}
                    mode={mode}
                    defaultQty={defaultQty}
                    defaultDiscountPercent={defaultDiscountPercent}
                    customerContext={customerContext}
                    getProductPriceDisplay={getProductPriceDisplay}
                    onConfirm={handleConfirmFromStep}
                    onBack={() => { setStep("browse"); setSelectedProduct(null); }}
                    confirmLabelText={multiple ? labels.addLabel : labels.confirmLabel}
                    labels={labels}
                    confirmButtonProps={confirmButtonProps}
                    cancelButtonProps={cancelButtonProps}
                    {...confirmStepProps}
                />
            )}

            {showCart && (
                <Cart
                    items={cart}
                    mode={mode}
                    onRemove={handleCartRemove}
                    onValidate={handleCartValidate}
                    labels={labels}
                    confirmButtonProps={confirmButtonProps}
                    {...cartProps}
                />
            )}
        </div>
    );
};

ProductCategoryBrowser.propTypes = propTypes;
ProductCategoryBrowser.defaultProps = defaultProps;

// ALL_PRODUCTS_ID, UNCATEGORIZED_ID and createDexieProductCategoryAdapters
// are exported from the parent barrel (../index.js / ../export.js) so that
// this file only exports a React component (keeps Fast Refresh happy).
