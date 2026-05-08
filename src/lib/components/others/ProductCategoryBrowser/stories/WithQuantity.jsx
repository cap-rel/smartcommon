import { setDefaultStory } from "../../../../../storybook";
import {
    mockProductsAdapter,
    mockCategoriesAdapter,
    mockGetProductPriceDisplay,
} from "../decorators";

export const WithQuantity = setDefaultStory({
    args: {
        open: true,
        mode: "quantity",
        multiple: false,
        defaultQty: 1,
        productsAdapter: mockProductsAdapter,
        categoriesAdapter: mockCategoriesAdapter,
        getProductPriceDisplay: mockGetProductPriceDisplay,
    },
    code: `
        <ProductCategoryBrowser
          open={isOpen}
          onClose={() => setIsOpen(false)}
          mode="quantity"
          defaultQty={1}
          productsAdapter={productsAdapter}
          categoriesAdapter={categoriesAdapter}
          getProductPriceDisplay={(product) => ({
            unitPrice: product.price,
            currency: "EUR",
            ttc: false,
          })}
          onSelect={({ product, qty }) => addLine(product, qty)}
        />
    `,
});
