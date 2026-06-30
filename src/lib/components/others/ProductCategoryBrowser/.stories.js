import { ProductCategoryBrowser } from "./";

export default {
    title: "Components/Others/ProductCategoryBrowser",
    component: ProductCategoryBrowser,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Fullscreen modal to navigate a product catalog by " +
                    "category and pick one or several products. Three modes: " +
                    "`select` (just pick), `quantity` (pick + qty), " +
                    "`quantity-discount` (pick + qty + discount + total). " +
                    "`multiple` keeps the browser open and accumulates " +
                    "selections in a footer cart. Data is fetched via " +
                    "`productsAdapter` / `categoriesAdapter` props - use " +
                    "`createDexieProductCategoryAdapters({ db })` to wire " +
                    "the smartcommon DB hook in one line.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        open: { control: "boolean", table: { category: "Main" } },
        mode: {
            control: { type: "select" },
            options: ["select", "quantity", "quantity-discount"],
            table: { category: "Main" },
        },
        multiple: { control: "boolean", table: { category: "Main" } },
        defaultQty: { control: "number", table: { category: "Main" } },
        defaultDiscountPercent: { control: "number", table: { category: "Main" } },
        showAllProductsTile: { control: "boolean", table: { category: "Main" } },
        showUncategorizedTile: { control: "boolean", table: { category: "Main" } },
        productType: { control: "text", table: { category: "Main" } },
        customerContext: { control: "object", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        // Adapters and callbacks aren't useful in the Controls panel.
        productsAdapter: { table: { disable: true } },
        categoriesAdapter: { table: { disable: true } },
        getProductPriceDisplay: { table: { disable: true } },
        renderItem: { table: { disable: true } },
        onSelect: { action: "selected", table: { category: "Events" } },
        onClose: { action: "closed", table: { category: "Events" } },
    },
    args: {},
};

import {
    Default as Def,
    WithQuantity as Wq,
    WithDiscount as Wd,
    Multiple as Mu,
} from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const WithQuantity = { tags: ["!dev"], ...Wq };
export const WithDiscount = { tags: ["!dev"], ...Wd };
export const Multiple = { tags: ["!dev"], ...Mu };
