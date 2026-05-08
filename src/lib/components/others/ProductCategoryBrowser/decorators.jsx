// Mock product / category dataset for Storybook stories. Designed to mirror
// the shape returned by the offlinepropale Dexie services so the visual
// layouts (categories grid + product tiles) reflect a realistic catalog.

const mockCategories = [
    { id: 10, label: "Plomberie", parent: 0, type: "product", color: "#0EA5E9" },
    { id: 11, label: "Électricité", parent: 0, type: "product", color: "#F59E0B" },
    { id: 12, label: "Outillage", parent: 0, type: "product", color: "#10B981" },
    { id: 13, label: "Quincaillerie", parent: 0, type: "product", color: "#A855F7" },
    { id: 20, label: "Robinetterie", parent: 10, type: "product", color: "#0EA5E9" },
    { id: 21, label: "Tubes et raccords", parent: 10, type: "product", color: "#0EA5E9" },
    { id: 30, label: "Câbles", parent: 11, type: "product", color: "#F59E0B" },
    { id: 31, label: "Interrupteurs", parent: 11, type: "product", color: "#F59E0B" },
];

const mockProducts = [
    { id: 100, ref: "TUB-014", label: "Tube cuivre 14mm (1m)", price: 8.5, tva_tx: 20, type: 0, categories: [{ id: 21 }] },
    { id: 101, ref: "TUB-016", label: "Tube cuivre 16mm (1m)", price: 9.9, tva_tx: 20, type: 0, categories: [{ id: 21 }] },
    { id: 102, ref: "ROB-MIT", label: "Robinet mitigeur évier", price: 89.0, tva_tx: 20, type: 0, categories: [{ id: 20 }] },
    { id: 103, ref: "ROB-LAV", label: "Robinet lavabo chromé", price: 64.0, tva_tx: 20, type: 0, categories: [{ id: 20 }] },
    { id: 104, ref: "CAB-25", label: "Câble 2.5mm² (1m)", price: 1.2, tva_tx: 20, type: 0, categories: [{ id: 30 }] },
    { id: 105, ref: "CAB-15", label: "Câble 1.5mm² (1m)", price: 0.9, tva_tx: 20, type: 0, categories: [{ id: 30 }] },
    { id: 106, ref: "INT-VV", label: "Interrupteur va-et-vient", price: 4.5, tva_tx: 20, type: 0, categories: [{ id: 31 }] },
    { id: 107, ref: "OUT-PER", label: "Perceuse-visseuse 18V", price: 159.0, tva_tx: 20, type: 0, categories: [{ id: 12 }] },
    { id: 108, ref: "OUT-CLE", label: "Clé à molette 250mm", price: 18.0, tva_tx: 20, type: 0, categories: [{ id: 12 }] },
    { id: 109, ref: "QUI-VIS", label: "Lot vis 4x40 (200 pcs)", price: 12.0, tva_tx: 20, type: 0, categories: [{ id: 13 }] },
    { id: 110, ref: "QUI-CHV", label: "Boîte chevilles murales", price: 6.5, tva_tx: 20, type: 0, categories: [{ id: 13 }] },
    { id: 111, ref: "DIV-001", label: "Article hors catégorie", price: 19.99, tva_tx: 20, type: 0 },
];

const isRoot = (cat) => !cat.parent || cat.parent === 0 || cat.parent === "0";

export const mockProductsAdapter = {
    search: ({ categoryId, query } = {}) => {
        let result = [...mockProducts];
        if (categoryId === null) {
            result = result.filter((p) => !p.categories || p.categories.length === 0);
        } else if (categoryId !== undefined) {
            result = result.filter((p) =>
                p.categories?.some((c) => c.id === categoryId)
            );
        }
        if (query) {
            const q = query.toLowerCase();
            result = result.filter((p) =>
                p.ref.toLowerCase().includes(q) ||
                p.label.toLowerCase().includes(q)
            );
        }
        return Promise.resolve(result);
    },
    getById: (id) => Promise.resolve(mockProducts.find((p) => p.id === id) || null),
};

export const mockCategoriesAdapter = {
    getRoots: () => Promise.resolve(mockCategories.filter(isRoot)),
    getChildren: (parentId) => Promise.resolve(
        mockCategories.filter((c) => c.parent === parentId || c.parent === String(parentId))
    ),
    getById: (id) => Promise.resolve(mockCategories.find((c) => c.id === id) || null),
};

// Default price formatter for "quantity-discount" stories. Returns a French
// EUR string so the UI shows realistic figures.
export const mockGetProductPriceDisplay = (product, customerContext) => {
    const unit = product.price ?? 0;
    const level = customerContext?.priceLevel || 1;
    const factor = level === 2 ? 0.95 : level === 3 ? 0.9 : 1;
    const display = unit * factor;
    return {
        unitPrice: unit,
        displayPrice: display,
        currency: "EUR",
        ttc: false,
        badge: factor < 1 ? `-${Math.round((1 - factor) * 100)}%` : null,
    };
};
