import { setDefaultStory } from "../../../../../storybook";
import {
    mockProductsAdapter,
    mockCategoriesAdapter,
    mockGetProductPriceDisplay,
} from "../decorators";

export const Multiple = setDefaultStory({
    args: {
        open: true,
        mode: "quantity-discount",
        multiple: true,
        defaultQty: 1,
        productsAdapter: mockProductsAdapter,
        categoriesAdapter: mockCategoriesAdapter,
        getProductPriceDisplay: mockGetProductPriceDisplay,
    },
    code: `
        // multiple=true keeps the browser open: each confirm step adds the
        // line to the cart in the footer, and the user validates the whole
        // batch with a single click.
        <ProductCategoryBrowser
          open={isOpen}
          onClose={() => setIsOpen(false)}
          mode="quantity-discount"
          multiple
          productsAdapter={productsAdapter}
          categoriesAdapter={categoriesAdapter}
          getProductPriceDisplay={priceFn}
          onSelect={(lines) => addManyLines(lines)}
        />
    `,
});
