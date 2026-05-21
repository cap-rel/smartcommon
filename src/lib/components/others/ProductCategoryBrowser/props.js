import PropTypes from "prop-types";

// Special IDs used internally for the "all products" and "uncategorized" tiles.
// Adapters never receive these as a category id: the orchestrator translates
// them into `categoryId: undefined` (all) and `categoryId: null` (none).
export const ALL_PRODUCTS_ID = "__all_products__";
export const UNCATEGORIZED_ID = "__uncategorized__";

export const MODES = ["select", "quantity", "quantity-discount"];

const productsAdapterShape = PropTypes.shape({
    search: PropTypes.func.isRequired,
    getById: PropTypes.func,
});

const categoriesAdapterShape = PropTypes.shape({
    getRoots: PropTypes.func.isRequired,
    getChildren: PropTypes.func.isRequired,
    getById: PropTypes.func,
});

export const propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,

    mode: PropTypes.oneOf(MODES),
    multiple: PropTypes.bool,

    productsAdapter: productsAdapterShape.isRequired,
    categoriesAdapter: categoriesAdapterShape.isRequired,

    // Passed through to adapter calls. Free-form so each app can route
    // its own filters (e.g. Dolibarr type 0=product, 1=service).
    productType: PropTypes.any,

    // Free-form context passed to getProductPriceDisplay so closures over the
    // current customer / price level / language remain optional.
    customerContext: PropTypes.object,

    // (product, customerContext) =>
    //   { unitPrice?, displayPrice?, displayPriceLabel?, currency?, badge?, ttc? }
    // The component renders displayPriceLabel verbatim if present, else a
    // simple "unitPrice currency" fallback. Returning null hides the price.
    getProductPriceDisplay: PropTypes.func,

    // (product, { selected, displayPrice }) => ReactNode
    // Override the per-product tile entirely. Default tile shows
    // image, ref, label and price.
    renderItem: PropTypes.func,

    defaultQty: PropTypes.number,
    defaultDiscountPercent: PropTypes.number,

    // Existing product to preselect; opens directly on the confirm step.
    // Pair with `defaultQty` / `defaultDiscountPercent` for a full edit
    // pre-fill. Only meaningful when mode is "quantity" or "quantity-discount".
    prefillProduct: PropTypes.object,

    // Layout for the special "all products" / "uncategorized" tiles at root.
    // Defaults to true for both. Set false to hide.
    showAllProductsTile: PropTypes.bool,
    showUncategorizedTile: PropTypes.bool,

    onSelect: PropTypes.func.isRequired,

    labels: PropTypes.object,

    containerProps: PropTypes.object,
    headerProps: PropTypes.object,
    titleProps: PropTypes.object,
    breadcrumbProps: PropTypes.object,
    searchInputProps: PropTypes.object,
    categoryGridProps: PropTypes.object,
    productGridProps: PropTypes.object,
    confirmStepProps: PropTypes.object,
    cartProps: PropTypes.object,
    confirmButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object,
};

export const defaultProps = {
    mode: "select",
    multiple: false,
    defaultQty: 1,
    defaultDiscountPercent: 0,
    showAllProductsTile: true,
    showUncategorizedTile: true,
};

export const DEFAULT_LABELS = {
    title: "Select a product",
    confirmTitle: "Confirm selection",
    searchPlaceholder: "Search...",
    allCategoriesCrumb: "All categories",
    allProductsTile: "All products",
    uncategorizedTile: "Uncategorized",
    noCategories: "No category available",
    noProducts: "No product in this category",
    noSearchResults: "No result",
    quantity: "Quantity",
    discount: "Discount",
    totalHT: "Total excl. tax",
    confirmLabel: "Confirm",
    addLabel: "Add",
    cancelLabel: "Cancel",
    changeProductLabel: "Change product",
    validateLabel: "Validate",
    cartEmpty: "No product selected",
    removeLabel: "Remove",
    pageLabel: "Page {current} / {total}",
    loadError: "Failed to load data",
};

export const buildDefaultPriceLabel = (display) => {
    if (!display) return null;
    if (display.displayPriceLabel) return display.displayPriceLabel;
    const value = display.displayPrice ?? display.unitPrice;
    if (value == null) return null;
    const currency = display.currency || "";
    const suffix = display.ttc ? " TTC" : display.ttc === false ? " HT" : "";
    return `${Number(value).toFixed(2)}${currency ? " " + currency : ""}${suffix}`;
};
