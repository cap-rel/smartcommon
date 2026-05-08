import { setDefaultStory } from "../../../../../storybook";
import {
    mockProductsAdapter,
    mockCategoriesAdapter,
} from "../decorators";

export const Default = setDefaultStory({
    args: {
        open: true,
        mode: "select",
        multiple: false,
        productsAdapter: mockProductsAdapter,
        categoriesAdapter: mockCategoriesAdapter,
    },
    code: `
        import { ProductCategoryBrowser, createDexieProductCategoryAdapters } from "@cap-rel/smartcommon";
        import db from "src/db";

        const { productsAdapter, categoriesAdapter } =
            createDexieProductCategoryAdapters({ db });

        <ProductCategoryBrowser
          open={isOpen}
          onClose={() => setIsOpen(false)}
          mode="select"
          productsAdapter={productsAdapter}
          categoriesAdapter={categoriesAdapter}
          onSelect={(product) => attachToInvoice(product)}
        />
    `,
});
