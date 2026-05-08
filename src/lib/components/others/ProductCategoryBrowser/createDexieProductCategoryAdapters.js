// Helper that wraps a Dexie database (the one returned by `useDb()` in the
// smartcommon DB hook) into the `productsAdapter` / `categoriesAdapter`
// pair expected by <ProductCategoryBrowser>. Calibrated on the offlinepropale
// schema, but every table name and filter is overridable.
//
// Expected schema (all field names are configurable):
//   db.products  : { id, ref, label, price_ht, type, barcode,
//                    tosell|for_sale|status_sell,
//                    categories: [{id, label, ...}, ...] }
//   db.categories: { id, label, parent, type, color, ... }
//   db.productDocuments  (optional): { product_id, type ("image"|...), blob }
//   db.categoryDocuments (optional): { category_id, type ("image"|...), blob }
//
// Usage:
//   import db from "src/db";
//   import { createDexieProductCategoryAdapters } from "@cap-rel/smartcommon";
//
//   const { productsAdapter, categoriesAdapter } =
//       createDexieProductCategoryAdapters({ db, attachImages: true });
//
//   <ProductCategoryBrowser
//       productsAdapter={productsAdapter}
//       categoriesAdapter={categoriesAdapter}
//       ...
//   />

const defaultIsProductActive = (product) => {
    const tosell = product.tosell ?? product.for_sale ?? product.status_sell;
    return tosell === undefined || tosell === null || Number(tosell) !== 0;
};

// Dolibarr categories carry `type` as integer (0=product, 2=customer) but
// the API mapper sometimes converts it to a string. Match all variants.
const CATEGORY_TYPE_ALIASES = {
    product: [0, "0", "product"],
    customer: [2, "2", "customer"],
};

const defaultMatchesCategoryType = (catType, requested) => {
    if (requested === undefined || requested === null) return true;
    const aliases = CATEGORY_TYPE_ALIASES[requested];
    if (aliases) return aliases.includes(catType);
    return catType === requested || String(catType) === String(requested);
};

const isRootCategory = (cat) =>
    !cat.parent || cat.parent === 0 || cat.parent === "0";

const matchesCategoryParent = (cat, parentId) =>
    cat.parent === parentId || cat.parent === String(parentId);

// Bulk-load images from a documents table and return a Map<entityId, Blob>.
const loadImageMap = async (table, foreignKey, ids) => {
    if (!table || ids.length === 0) return new Map();
    // anyOf() is the Dexie equivalent of "WHERE foreignKey IN (...)".
    const docs = await table
        .where(foreignKey)
        .anyOf(ids)
        .filter((d) => d.type === "image")
        .toArray();
    const map = new Map();
    for (const doc of docs) {
        if (!doc.blob) continue;
        if (!map.has(doc[foreignKey])) {
            map.set(doc[foreignKey], doc.blob);
        }
    }
    return map;
};

const attachImage = (entity, blob) => {
    if (!blob) return entity;
    return { ...entity, image: { ...(entity.image || {}), blob } };
};

export const createDexieProductCategoryAdapters = (options = {}) => {
    const {
        db,
        productsTable = "products",
        categoriesTable = "categories",
        productDocumentsTable = "productDocuments",
        categoryDocumentsTable = "categoryDocuments",
        productImageForeignKey = "product_id",
        categoryImageForeignKey = "category_id",
        isProductActive = defaultIsProductActive,
        matchesCategoryType = defaultMatchesCategoryType,
        // Set false to skip the productDocuments / categoryDocuments join
        // entirely (cheaper, but tiles will render with placeholder icons).
        attachImages = true,
    } = options;

    if (!db) {
        throw new Error("createDexieProductCategoryAdapters: db is required");
    }

    const productsRef = () => db[productsTable];
    const categoriesRef = () => db[categoriesTable];
    const productDocsRef = () => db[productDocumentsTable];
    const categoryDocsRef = () => db[categoryDocumentsTable];

    const filterProducts = (predicate) =>
        productsRef()
            .filter((p) => isProductActive(p) && predicate(p))
            .toArray();

    const filterByQuery = (products, query) => {
        if (!query) return products;
        const q = query.toLowerCase();
        return products.filter((p) =>
            (p.ref && p.ref.toLowerCase().includes(q)) ||
            (p.label && p.label.toLowerCase().includes(q))
        );
    };

    const filterByType = (products, type) => {
        if (type === undefined || type === null) return products;
        return products.filter((p) => String(p.type) === String(type));
    };

    const productsAdapter = {
        search: async ({ categoryId, query, type } = {}) => {
            if (!productsRef()) return [];
            let products;
            if (categoryId === undefined) {
                products = await filterProducts(() => true);
            } else if (categoryId === null) {
                products = await filterProducts(
                    (p) => !p.categories || p.categories.length === 0
                );
            } else {
                products = await filterProducts(
                    (p) => p.categories?.some((c) => c.id === categoryId)
                );
            }
            products = filterByType(products, type);
            products = filterByQuery(products, query);

            if (!attachImages || !productDocsRef()) return products;
            const ids = products.map((p) => p.id).filter((id) => id != null);
            const imageMap = await loadImageMap(productDocsRef(), productImageForeignKey, ids);
            return products.map((p) => attachImage(p, imageMap.get(p.id)));
        },

        getById: async (id) => {
            if (!productsRef()) return null;
            const product = await productsRef().get(id);
            if (!product || !attachImages || !productDocsRef()) return product || null;
            const map = await loadImageMap(productDocsRef(), productImageForeignKey, [id]);
            return attachImage(product, map.get(id));
        },
    };

    const enrichCategories = async (categories) => {
        if (!attachImages || !categoryDocsRef() || categories.length === 0) {
            return categories;
        }
        const ids = categories.map((c) => c.id).filter((id) => id != null);
        const imageMap = await loadImageMap(categoryDocsRef(), categoryImageForeignKey, ids);
        return categories.map((c) => attachImage(c, imageMap.get(c.id)));
    };

    const categoriesAdapter = {
        getRoots: async (type) => {
            if (!categoriesRef()) return [];
            const cats = await categoriesRef()
                .filter((c) => matchesCategoryType(c.type, type) && isRootCategory(c))
                .toArray();
            return enrichCategories(cats);
        },

        getChildren: async (parentId) => {
            if (!categoriesRef()) return [];
            const cats = await categoriesRef()
                .filter((c) => matchesCategoryParent(c, parentId))
                .toArray();
            return enrichCategories(cats);
        },

        getById: async (id) => {
            if (!categoriesRef()) return null;
            const cat = await categoriesRef().get(id);
            if (!cat) return null;
            const enriched = await enrichCategories([cat]);
            return enriched[0];
        },
    };

    return { productsAdapter, categoriesAdapter };
};
