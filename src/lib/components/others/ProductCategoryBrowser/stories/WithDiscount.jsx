import { setDefaultStory } from "../../../../../storybook";
import {
    mockProductsAdapter,
    mockCategoriesAdapter,
    mockGetProductPriceDisplay,
} from "../decorators";

export const WithDiscount = setDefaultStory({
    args: {
        open: true,
        mode: "quantity-discount",
        multiple: false,
        defaultQty: 1,
        defaultDiscountPercent: 0,
        customerContext: { priceLevel: 2 },
        productsAdapter: mockProductsAdapter,
        categoriesAdapter: mockCategoriesAdapter,
        getProductPriceDisplay: mockGetProductPriceDisplay,
    },
    code: `
        // Apply a per-customer price level: smartAuth-aware getProductPriceDisplay
        // computes the discounted price and a badge for the tile.
        <ProductCategoryBrowser
          open={isOpen}
          onClose={() => setIsOpen(false)}
          mode="quantity-discount"
          customerContext={{ priceLevel: customer.priceLevel }}
          productsAdapter={productsAdapter}
          categoriesAdapter={categoriesAdapter}
          getProductPriceDisplay={(product, ctx) => {
            const factor = ctx.priceLevel === 2 ? 0.95 : 1;
            return {
              unitPrice: product.price,
              displayPrice: product.price * factor,
              currency: "EUR",
              ttc: false,
              badge: factor < 1 ? \`-\${Math.round((1 - factor) * 100)}%\` : null,
            };
          }}
          onSelect={({ product, qty, discountPercent, computedTotal }) =>
            addLine(product, { qty, discountPercent, total: computedTotal })
          }
        />
    `,
});
