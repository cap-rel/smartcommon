import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// Stub Button (used in ConfirmStep / Cart). The form primitives barrel cycle
// described in CLAUDE.md only matters for Input/Select/Boolean, but Button is
// often easier to drive in a test as a plain HTML <button>.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Button: ({ label, type = "button", disabled, onClick, buttonProps }) => (
            <button
                type={type}
                disabled={disabled || buttonProps?.disabled}
                onClick={onClick}
                {...(buttonProps || {})}
            >
                {label}
            </button>
        ),
    };
});

// happy-dom does not ship a ResizeObserver. The component uses it to compute
// the grid layout; a no-op stub is enough since we never assert on tile size.
beforeEach(() => {
    if (typeof globalThis.ResizeObserver === "undefined") {
        globalThis.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    }
});

import {
    ProductCategoryBrowser,
    ALL_PRODUCTS_ID,
    UNCATEGORIZED_ID,
} from "./index";

const fixtureCategories = [
    { id: 10, label: "Plomberie", parent: 0, type: "product" },
    { id: 11, label: "Électricité", parent: 0, type: "product" },
    { id: 20, label: "Robinetterie", parent: 10, type: "product" },
];

const fixtureProducts = [
    { id: 100, ref: "TUB-001", label: "Tube cuivre 14mm", categories: [{ id: 10 }], type: 0 },
    { id: 101, ref: "ROB-001", label: "Robinet mitigeur", categories: [{ id: 20 }], type: 0 },
    { id: 102, ref: "CAB-001", label: "Câble électrique", categories: [{ id: 11 }], type: 0 },
    { id: 103, ref: "MISC", label: "Article sans catégorie", type: 0 },
];

const makeAdapters = () => {
    const productsAdapter = {
        search: vi.fn(({ categoryId, query } = {}) => {
            let result = [...fixtureProducts];
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
        }),
        getById: vi.fn((id) =>
            Promise.resolve(fixtureProducts.find((p) => p.id === id) || null)
        ),
    };
    const categoriesAdapter = {
        getRoots: vi.fn(() =>
            Promise.resolve(fixtureCategories.filter((c) => c.parent === 0))
        ),
        getChildren: vi.fn((parentId) =>
            Promise.resolve(fixtureCategories.filter((c) => c.parent === parentId))
        ),
        getById: vi.fn((id) =>
            Promise.resolve(fixtureCategories.find((c) => c.id === id) || null)
        ),
    };
    return { productsAdapter, categoriesAdapter };
};

const renderBrowser = (overrides = {}) => {
    const { productsAdapter, categoriesAdapter } = makeAdapters();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const utils = render(
        <ProductCategoryBrowser
            open
            onClose={onClose}
            onSelect={onSelect}
            productsAdapter={productsAdapter}
            categoriesAdapter={categoriesAdapter}
            {...overrides}
        />
    );
    return { ...utils, productsAdapter, categoriesAdapter, onSelect, onClose };
};

describe("ProductCategoryBrowser - rendering", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("renders nothing when open is false", () => {
        const { container } = render(
            <ProductCategoryBrowser
                open={false}
                onClose={() => {}}
                onSelect={() => {}}
                productsAdapter={{ search: vi.fn(), getById: vi.fn() }}
                categoriesAdapter={{
                    getRoots: vi.fn(),
                    getChildren: vi.fn(),
                    getById: vi.fn(),
                }}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it("loads root categories on open", async () => {
        const { categoriesAdapter } = renderBrowser();
        await waitFor(() => {
            expect(categoriesAdapter.getRoots).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });
        expect(screen.getByText("Électricité")).toBeDefined();
    });

    it("shows the special tiles at root by default", async () => {
        renderBrowser();
        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        expect(screen.getByText(/Uncategorized/i)).toBeDefined();
    });

    it("hides the special tiles when disabled", async () => {
        renderBrowser({
            showAllProductsTile: false,
            showUncategorizedTile: false,
        });
        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });
        expect(screen.queryByText(/All products/i)).toBeNull();
        expect(screen.queryByText(/Uncategorized/i)).toBeNull();
    });
});

describe("ProductCategoryBrowser - navigation", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("navigates into a category and loads its children", async () => {
        const { categoriesAdapter } = renderBrowser();
        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Plomberie"));

        await waitFor(() => {
            expect(categoriesAdapter.getChildren).toHaveBeenCalledWith(10);
        });
        await waitFor(() => {
            expect(screen.getByText("Robinetterie")).toBeDefined();
        });
    });

    it("falls back to ProductGrid when entering a leaf category", async () => {
        const { productsAdapter } = renderBrowser();
        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Plomberie"));
        await waitFor(() => {
            expect(screen.getByText("Robinetterie")).toBeDefined();
        });
        fireEvent.click(screen.getByText("Robinetterie"));

        await waitFor(() => {
            expect(productsAdapter.search).toHaveBeenCalledWith(
                expect.objectContaining({ categoryId: 20 })
            );
        });
        await waitFor(() => {
            expect(screen.getByText("Robinet mitigeur")).toBeDefined();
        });
    });

    it("'All products' tile lists every product", async () => {
        const { productsAdapter } = renderBrowser();
        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });

        fireEvent.click(screen.getAllByText(/All products/i)[0]);

        await waitFor(() => {
            expect(productsAdapter.search).toHaveBeenCalledWith(
                expect.objectContaining({ categoryId: undefined })
            );
        });
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });
    });

    it("'Uncategorized' tile passes categoryId=null to the adapter", async () => {
        const { productsAdapter } = renderBrowser();
        await waitFor(() => {
            expect(screen.getByText(/Uncategorized/i)).toBeDefined();
        });

        fireEvent.click(screen.getByText(/Uncategorized/i));

        await waitFor(() => {
            expect(productsAdapter.search).toHaveBeenCalledWith(
                expect.objectContaining({ categoryId: null })
            );
        });
        await waitFor(() => {
            expect(screen.getByText("Article sans catégorie")).toBeDefined();
        });
    });
});

describe("ProductCategoryBrowser - search", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("debounces search and queries the adapter with the typed text", async () => {
        const { productsAdapter } = renderBrowser();
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Search/)).toBeDefined();
        });

        const input = screen.getByPlaceholderText(/Search/);
        fireEvent.change(input, { target: { value: "robinet" } });

        await waitFor(
            () => {
                expect(productsAdapter.search).toHaveBeenCalledWith(
                    expect.objectContaining({ query: "robinet", categoryId: undefined })
                );
            },
            { timeout: 1000 }
        );
        await waitFor(() => {
            expect(screen.getByText("Robinet mitigeur")).toBeDefined();
        });
    });
});

describe("ProductCategoryBrowser - mode select", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("non-multiple: clicking a product calls onSelect(product) and onClose", async () => {
        const { onSelect, onClose } = renderBrowser();

        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        fireEvent.click(screen.getAllByText(/All products/i)[0]);
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Tube cuivre 14mm"));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0]).toMatchObject({
            id: 100,
            ref: "TUB-001",
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("multiple: clicking accumulates products in the cart and validate returns the array", async () => {
        const { onSelect, onClose } = renderBrowser({ multiple: true });

        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        fireEvent.click(screen.getAllByText(/All products/i)[0]);
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Tube cuivre 14mm"));
        fireEvent.click(screen.getByText("Robinet mitigeur"));

        // Validation button shows item count.
        const validateBtn = await screen.findByRole("button", { name: /Validate \(2\)/ });
        fireEvent.click(validateBtn);

        expect(onSelect).toHaveBeenCalledTimes(1);
        const payload = onSelect.mock.calls[0][0];
        expect(Array.isArray(payload)).toBe(true);
        expect(payload).toHaveLength(2);
        expect(payload[0]).toMatchObject({ id: 100 });
        expect(payload[1]).toMatchObject({ id: 101 });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

describe("ProductCategoryBrowser - mode quantity", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("opens a confirm step and returns { product, qty } on confirm", async () => {
        const { onSelect, onClose } = renderBrowser({ mode: "quantity", defaultQty: 3 });

        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        fireEvent.click(screen.getAllByText(/All products/i)[0]);
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });
        fireEvent.click(screen.getByText("Tube cuivre 14mm"));

        // Confirm step rendered.
        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });

        // Default qty pre-filled at 3.
        const qtyInput = screen.getByDisplayValue("3");
        expect(qtyInput).toBeDefined();

        fireEvent.click(screen.getByRole("button", { name: /Confirm$/ }));

        expect(onSelect).toHaveBeenCalledTimes(1);
        const payload = onSelect.mock.calls[0][0];
        expect(payload.product).toMatchObject({ id: 100 });
        expect(payload.qty).toBe(3);
        // No discount in mode "quantity".
        expect(payload.discountPercent).toBeUndefined();
        expect(onClose).toHaveBeenCalled();
    });
});

describe("ProductCategoryBrowser - mode quantity-discount", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("returns { product, qty, discountPercent, computedTotal } when price is known", async () => {
        const getProductPriceDisplay = vi.fn(() => ({ unitPrice: 10, currency: "EUR" }));
        const { onSelect } = renderBrowser({
            mode: "quantity-discount",
            getProductPriceDisplay,
            defaultQty: 2,
            defaultDiscountPercent: 10,
        });

        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        fireEvent.click(screen.getAllByText(/All products/i)[0]);
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });
        fireEvent.click(screen.getByText("Tube cuivre 14mm"));

        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });

        fireEvent.click(screen.getByRole("button", { name: /Confirm$/ }));

        await waitFor(() => {
            expect(onSelect).toHaveBeenCalled();
        });
        const payload = onSelect.mock.calls[0][0];
        expect(payload.qty).toBe(2);
        expect(payload.discountPercent).toBe(10);
        // 10 * 2 * (1 - 10/100) = 18
        expect(payload.computedTotal).toBeCloseTo(18, 2);
    });

    it("multiple: confirming adds to cart and returns array on validate", async () => {
        const getProductPriceDisplay = vi.fn(() => ({ unitPrice: 5, currency: "EUR" }));
        const { onSelect } = renderBrowser({
            mode: "quantity-discount",
            multiple: true,
            getProductPriceDisplay,
        });

        await waitFor(() => {
            expect(screen.getAllByText(/All products/i)[0]).toBeDefined();
        });
        fireEvent.click(screen.getAllByText(/All products/i)[0]);
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });

        // First product
        fireEvent.click(screen.getByText("Tube cuivre 14mm"));
        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });
        fireEvent.click(screen.getByRole("button", { name: /Add/i }));

        // After "Add", we're back to browse.
        await waitFor(() => {
            expect(screen.getByText("Tube cuivre 14mm")).toBeDefined();
        });

        // Second product
        fireEvent.click(screen.getByText("Robinet mitigeur"));
        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });
        fireEvent.click(screen.getByRole("button", { name: /Add/i }));

        const validateBtn = await screen.findByRole("button", { name: /Validate \(2\)/ });
        await act(async () => { fireEvent.click(validateBtn); });

        const payload = onSelect.mock.calls[0][0];
        expect(Array.isArray(payload)).toBe(true);
        expect(payload).toHaveLength(2);
        expect(payload[0].qty).toBe(1);
        expect(payload[1].qty).toBe(1);
    });
});

describe("ProductCategoryBrowser - edit / prefillProduct", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("jumps straight to the confirm step when prefillProduct is provided", async () => {
        const existing = { id: 200, ref: "EDIT-1", label: "Edited line" };
        const { onSelect, onClose } = renderBrowser({
            mode: "quantity-discount",
            prefillProduct: existing,
            defaultQty: 5,
            defaultDiscountPercent: 15,
        });

        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });

        // Pre-filled values are visible.
        expect(screen.getByDisplayValue("5")).toBeDefined();
        expect(screen.getByDisplayValue("15")).toBeDefined();
        expect(screen.getByText("Edited line")).toBeDefined();

        fireEvent.click(screen.getByRole("button", { name: /Confirm$/ }));

        const payload = onSelect.mock.calls[0][0];
        expect(payload.product).toMatchObject({ id: 200 });
        expect(payload.qty).toBe(5);
        expect(payload.discountPercent).toBe(15);
        expect(onClose).toHaveBeenCalled();
    });

    it("ignores prefillProduct in mode 'select'", async () => {
        const existing = { id: 200, ref: "EDIT-1", label: "Edited line" };
        renderBrowser({ mode: "select", prefillProduct: existing });
        // Should still show the categories grid, not the confirm step.
        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });
        expect(screen.queryByText(/Confirm selection/i)).toBeNull();
    });

    it("'Change product' from confirm step returns to browse", async () => {
        const existing = { id: 200, ref: "EDIT-1", label: "Edited line" };
        renderBrowser({
            mode: "quantity",
            prefillProduct: existing,
        });
        await waitFor(() => {
            expect(screen.getByText(/Confirm selection/i)).toBeDefined();
        });

        fireEvent.click(screen.getByRole("button", { name: /Change product/i }));

        await waitFor(() => {
            expect(screen.getByText("Plomberie")).toBeDefined();
        });
        expect(screen.queryByText(/Confirm selection/i)).toBeNull();
    });
});

describe("ProductCategoryBrowser - labels override", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("uses custom labels when provided", async () => {
        renderBrowser({
            labels: {
                title: "Choose an item",
                allProductsTile: "All",
                searchPlaceholder: "Type here",
            },
        });
        await waitFor(() => {
            expect(screen.getByText("Choose an item")).toBeDefined();
        });
        expect(screen.getByText("All")).toBeDefined();
        expect(screen.getByPlaceholderText("Type here")).toBeDefined();
    });
});
