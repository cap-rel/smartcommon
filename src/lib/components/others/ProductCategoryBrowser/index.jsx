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

/**
 * Mount gate. Everything below only exists while the browser is open, so each
 * opening starts from freshly seeded state instead of being wiped by a reset
 * effect. Remounting on a new prefilled product / mode reproduces what that
 * effect used to do when those props changed mid-flight.
 */
export const ProductCategoryBrowser = (props) => {
    if (!props.open) {
        return null;
    }

    return (
        <ProductCategoryBrowserContent
            key={`${props.prefillProduct?.id ?? ""}|${props.mode ?? "select"}`}
            {...props}
        />
    );
};

const ProductCategoryBrowserContent = (props) => {
    const {
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

    // A prefilled product in a quantity mode opens straight on the confirm
    // step (edit-an-existing-line flow).
    const canPrefill = prefillProduct
        && (mode === "quantity" || mode === "quantity-discount");

    const [step, setStep] = useState(canPrefill ? "confirm" : "browse");
    const [parentId, setParentId] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    // Subcategories, tagged with the request they answer. Holding the answer
    // and its question together lets "loading" be derived (we hold nothing for
    // what we are rendering) instead of being flipped on from the effect.
    const [subResult, setSubResult] = useState({ key: null, items: [] });
    const [searchInput, setSearchInput] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(canPrefill ? prefillProduct : null);
    const [cart, setCart] = useState([]);

    // Body scroll lock + escape key.
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

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

    // Identifies the subcategory request the current render needs.
    const subKey = inSearchMode || isSpecialTile ? null : `${parentId}|${productType}`;
    const subLoading = subKey !== null && subResult.key !== subKey;
    const subCategories = subResult.key === subKey ? subResult.items : [];

    // NOTE: `categoriesAdapter` and `productsAdapter` MUST be referentially
    // stable (memoized by the consumer with useMemo). They are dependencies of
    // this effect and of the search/product effects; an adapter rebuilt on every
    // parent render would re-trigger these fetches on each render/keystroke
    // (refetch storm). Pass the SAME object reference across renders.
    useEffect(() => {
        // Nothing to fetch in search mode or on a special tile: `subCategories`
        // above already reads as empty in those states.
        if (subKey === null) {
            return undefined;
        }
        let cancelled = false;
        const fetcher = parentId === null
            ? categoriesAdapter.getRoots(productType)
            : categoriesAdapter.getChildren(parentId);
        Promise.resolve(fetcher)
            .then((items) => { if (!cancelled) setSubResult({ key: subKey, items: items || [] }); })
            .catch((err) => {
                console.error("ProductCategoryBrowser: failed to load categories", err);
                // Tag the failure with the key too, otherwise the derived
                // `subLoading` would stay true forever on an adapter error.
                if (!cancelled) setSubResult({ key: subKey, items: [] });
            });
        return () => { cancelled = true; };
    }, [subKey, parentId, productType, categoriesAdapter]);

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
                    // Remounting on a new product / new defaults is what resets
                    // the qty + discount inputs: ConfirmStep seeds them from
                    // these props in its state initializers, so React's own
                    // "reset state with a key" is enough - no reset effect.
                    key={`${selectedProduct?.id}|${defaultQty}|${defaultDiscountPercent}`}
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
