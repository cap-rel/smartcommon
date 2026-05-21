import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// The smartcommon barrel cycle (lib/components -> lib/hooks -> lib/components)
// can shadow Input / Button / Spinner under Vitest, so swap them with plain
// HTML stubs. The component does not rely on any of their internal behaviour
// beyond rendering and calling onChange/onClick.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Input: ({ name, type = "text", value, onChange, placeholder, readOnly }) => (
            <input
                name={name}
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                data-testid="datatable-search-input"
            />
        ),
        Button: ({ label, type = "button", disabled, onClick, children }) => (
            <button type={type} disabled={disabled} onClick={onClick}>
                {label || children}
            </button>
        ),
        Spinner: () => <div data-testid="spinner" />,
    };
});

import { DataTable } from "./index";
import { DEFAULT_LABELS } from "./props";

const fixtureColumns = [
    { key: "name", label: "Nom", sortable: true },
    { key: "qty", label: "Quantité", sortable: true, align: "right" },
    { key: "city", label: "Ville" },
];

const fixtureData = [
    { id: 1, name: "Alice", qty: 3, city: "Paris" },
    { id: 2, name: "Bob", qty: 1, city: "Lyon" },
    { id: 3, name: "Claire", qty: 5, city: "Marseille" },
    { id: 4, name: "Daniel", qty: 2, city: "Toulouse" },
    { id: 5, name: "Eve", qty: 4, city: "Nice" },
];

describe("DataTable - basic rendering", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("renders one row per data item with the provided columns", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData.slice(0, 3)}
                mode="table"
            />
        );
        // Headers
        expect(screen.getByText("Nom")).toBeDefined();
        expect(screen.getByText("Quantité")).toBeDefined();
        expect(screen.getByText("Ville")).toBeDefined();
        // Rows: three names appear.
        expect(screen.getByText("Alice")).toBeDefined();
        expect(screen.getByText("Bob")).toBeDefined();
        expect(screen.getByText("Claire")).toBeDefined();
    });

    it("uses a custom render function when provided", () => {
        const columns = [
            { key: "name", label: "Nom" },
            {
                key: "qty",
                label: "Qté",
                render: (row) => <span data-testid={`q-${row.id}`}>x{row.qty}</span>,
            },
        ];
        render(<DataTable columns={columns} data={fixtureData.slice(0, 2)} mode="table" />);
        expect(screen.getByTestId("q-1").textContent).toBe("x3");
        expect(screen.getByTestId("q-2").textContent).toBe("x1");
    });

    it("exposes data-component on the container", () => {
        const { container } = render(
            <DataTable columns={fixtureColumns} data={[]} mode="table" />
        );
        expect(container.querySelector('[data-component="DataTable"]')).not.toBeNull();
    });
});

describe("DataTable - empty state", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("shows the default empty label when data is empty", () => {
        render(<DataTable columns={fixtureColumns} data={[]} mode="table" />);
        expect(screen.getByText(DEFAULT_LABELS.empty)).toBeDefined();
    });

    it("shows a custom empty node when provided", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={[]}
                mode="table"
                empty={<span data-testid="empty-custom">Rien à voir</span>}
            />
        );
        expect(screen.getByTestId("empty-custom")).toBeDefined();
    });

    it("shows the labels.empty override when provided via labels prop", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={[]}
                mode="table"
                labels={{ empty: "Liste vide" }}
            />
        );
        expect(screen.getByText("Liste vide")).toBeDefined();
    });
});

describe("DataTable - sorting (uncontrolled)", () => {
    afterEach(() => { vi.clearAllMocks(); });

    const getRowNames = (container) => Array.from(
        container.querySelectorAll("tbody tr")
    ).map((tr) => tr.querySelectorAll("td")[0]?.textContent);

    it("clicking a sortable header toggles asc then desc", () => {
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                sortable
                pageSize={0}
            />
        );

        // Initial order = data order (Alice, Bob, Claire, Daniel, Eve).
        expect(getRowNames(container)).toEqual([
            "Alice", "Bob", "Claire", "Daniel", "Eve",
        ]);

        // First click -> asc.
        fireEvent.click(screen.getByText("Nom"));
        expect(getRowNames(container)).toEqual([
            "Alice", "Bob", "Claire", "Daniel", "Eve",
        ]);

        // Second click -> desc.
        fireEvent.click(screen.getByText("Nom"));
        expect(getRowNames(container)).toEqual([
            "Eve", "Daniel", "Claire", "Bob", "Alice",
        ]);

        // Third click cycles back to asc.
        fireEvent.click(screen.getByText("Nom"));
        expect(getRowNames(container)).toEqual([
            "Alice", "Bob", "Claire", "Daniel", "Eve",
        ]);
    });

    it("ignores click on non-sortable headers", () => {
        const cols = [
            { key: "name", label: "Nom", sortable: true },
            { key: "city", label: "Ville" },
        ];
        const { container } = render(
            <DataTable columns={cols} data={fixtureData} mode="table" sortable pageSize={0} />
        );
        fireEvent.click(screen.getByText("Ville"));
        // Unchanged order.
        expect(getRowNames(container)).toEqual([
            "Alice", "Bob", "Claire", "Daniel", "Eve",
        ]);
    });
});

describe("DataTable - sorting (controlled)", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("does not reorder data but calls onSortChange when sortBy is controlled", () => {
        const onSortChange = vi.fn();
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                sortBy={null}
                onSortChange={onSortChange}
                pageSize={0}
            />
        );

        const getRowNames = () => Array.from(
            container.querySelectorAll("tbody tr")
        ).map((tr) => tr.querySelectorAll("td")[0]?.textContent);

        const initial = getRowNames();
        fireEvent.click(screen.getByText("Nom"));

        // Order unchanged (caller controls sortBy and didn't update it).
        expect(getRowNames()).toEqual(initial);
        // Callback fired with the proposed sort.
        expect(onSortChange).toHaveBeenCalledTimes(1);
        expect(onSortChange.mock.calls[0][0]).toEqual({
            key: "name", direction: "asc",
        });
    });
});

describe("DataTable - search", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("filters rows by case-insensitive substring (debounced)", async () => {
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                searchable
                pageSize={0}
            />
        );

        const input = screen.getByTestId("datatable-search-input");
        fireEvent.change(input, { target: { value: "CLAI" } });

        await waitFor(() => {
            const rows = container.querySelectorAll("tbody tr");
            expect(rows.length).toBe(1);
            expect(rows[0].textContent).toMatch(/Claire/);
        }, { timeout: 1000 });
    });

    it("emits onSearchChange when typing in the search input", () => {
        const onSearchChange = vi.fn();
        render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                searchable
                onSearchChange={onSearchChange}
            />
        );
        fireEvent.change(screen.getByTestId("datatable-search-input"), {
            target: { value: "alice" },
        });
        expect(onSearchChange).toHaveBeenCalledWith("alice");
    });
});

describe("DataTable - pagination", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("paginates with pageSize=2 and 5 rows", () => {
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                pageSize={2}
            />
        );

        // Page 1 of 3 - shows Alice + Bob.
        expect(container.querySelectorAll("tbody tr").length).toBe(2);
        expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
        expect(screen.getByText("Alice")).toBeDefined();
        expect(screen.getByText("Bob")).toBeDefined();

        // Next -> page 2 (Claire + Daniel).
        fireEvent.click(screen.getByRole("button", { name: DEFAULT_LABELS.next }));
        expect(screen.getByText(/Page 2 of 3/)).toBeDefined();
        expect(screen.getByText("Claire")).toBeDefined();
        expect(screen.getByText("Daniel")).toBeDefined();
    });

    it("hides pagination when the filtered set fits on one page", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData.slice(0, 2)}
                mode="table"
                pageSize={10}
            />
        );
        expect(screen.queryByRole("button", { name: DEFAULT_LABELS.next })).toBeNull();
    });
});

describe("DataTable - selection", () => {
    afterEach(() => { vi.clearAllMocks(); });

    const getRowCheckboxes = (container) => Array.from(
        container.querySelectorAll('tbody input[type="checkbox"]')
    );

    it("clicking a row checkbox calls onSelectionChange with the new array", () => {
        const onSelectionChange = vi.fn();
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                selectable
                onSelectionChange={onSelectionChange}
                pageSize={0}
            />
        );

        const checkboxes = getRowCheckboxes(container);
        fireEvent.click(checkboxes[0]);
        expect(onSelectionChange).toHaveBeenCalledWith([1]);

        fireEvent.click(checkboxes[2]);
        // Internal state already has [1] - so [1, 3].
        expect(onSelectionChange.mock.calls[1][0]).toEqual([1, 3]);
    });

    it("header checkbox toggles all currently visible rows", () => {
        const onSelectionChange = vi.fn();
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                selectable
                onSelectionChange={onSelectionChange}
                pageSize={2}
            />
        );

        // Only 2 rows visible (page 1: ids 1 and 2).
        const headerCheckbox = container.querySelector(
            'thead input[type="checkbox"]'
        );
        fireEvent.click(headerCheckbox);
        expect(onSelectionChange).toHaveBeenCalledWith([1, 2]);

        // Click again -> deselect those.
        fireEvent.click(headerCheckbox);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it("renders a selection summary bar when rows are selected", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                selectable
                selectedKeys={[1, 3]}
                onSelectionChange={() => {}}
                pageSize={0}
            />
        );
        expect(screen.getByText(/2 row\(s\)/)).toBeDefined();
    });
});

describe("DataTable - row click", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("fires onRowClick when clicking a row", () => {
        const onRowClick = vi.fn();
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData.slice(0, 2)}
                mode="table"
                onRowClick={onRowClick}
            />
        );

        const firstRow = container.querySelector("tbody tr");
        fireEvent.click(firstRow);

        expect(onRowClick).toHaveBeenCalledTimes(1);
        expect(onRowClick.mock.calls[0][0]).toMatchObject({ id: 1, name: "Alice" });
        expect(onRowClick.mock.calls[0][1]).toBe(0);
    });

    it("does not fire onRowClick when clicking inside a [data-row-action] descendant", () => {
        const onRowClick = vi.fn();
        const cols = [
            { key: "name", label: "Nom" },
            {
                key: "qty",
                label: "Qté",
                render: (row) => (
                    <button data-row-action onClick={() => {}}>
                        x{row.qty}
                    </button>
                ),
            },
        ];
        const { container } = render(
            <DataTable
                columns={cols}
                data={fixtureData.slice(0, 1)}
                mode="table"
                onRowClick={onRowClick}
            />
        );

        const actionBtn = container.querySelector("button[data-row-action]");
        fireEvent.click(actionBtn);

        expect(onRowClick).not.toHaveBeenCalled();
    });

    it("clicking a selection checkbox does not trigger onRowClick", () => {
        const onRowClick = vi.fn();
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData.slice(0, 1)}
                mode="table"
                selectable
                onRowClick={onRowClick}
            />
        );
        const cb = container.querySelector('tbody input[type="checkbox"]');
        fireEvent.click(cb);
        expect(onRowClick).not.toHaveBeenCalled();
    });
});

describe("DataTable - cards mode", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("renders cards (no <table>) when mode='cards'", () => {
        const { container } = render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData.slice(0, 2)}
                mode="cards"
            />
        );
        // No table element at all in pure cards mode.
        expect(container.querySelector("table")).toBeNull();
        // Each row label appears once per card next to its value.
        expect(screen.getAllByText("Nom").length).toBe(2);
        expect(screen.getAllByText("Quantité").length).toBe(2);
    });
});

describe("DataTable - loading mode", () => {
    afterEach(() => { vi.clearAllMocks(); });

    it("shows the spinner when loading", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={fixtureData}
                mode="table"
                loading
            />
        );
        expect(screen.getAllByTestId("spinner").length).toBeGreaterThan(0);
        // Empty state should NOT show when loading.
        expect(screen.queryByText(DEFAULT_LABELS.empty)).toBeNull();
    });

    it("keeps the header visible while loading in table mode", () => {
        render(
            <DataTable
                columns={fixtureColumns}
                data={[]}
                mode="table"
                loading
            />
        );
        expect(screen.getByText("Nom")).toBeDefined();
    });
});
