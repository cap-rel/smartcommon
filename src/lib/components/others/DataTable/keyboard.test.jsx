import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Same stubs as index.test.jsx: the lib/components barrel cycle can shadow
// Input / Button / Spinner under Vitest.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Input: ({ name, value, onChange }) => (
            <input name={name} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} />
        ),
        Button: ({ label, disabled, onClick }) => (
            <button type="button" disabled={disabled} onClick={onClick}>{label}</button>
        ),
        Spinner: () => <div data-testid="spinner" />,
    };
});

import { DataTable } from "./index";
import { ViewportContext } from "lib/components/app/ViewportProvider/context";

const columns = [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
];

const data = [
    { id: 1, name: "Alice", city: "Paris" },
    { id: 2, name: "Bob", city: "Lyon" },
];

const withViewport = (viewport, ui) => (
    <ViewportContext.Provider
        value={{ viewport, isMobile: viewport === "mobile", isTablet: viewport === "tablet", isDesktop: viewport === "desktop" }}
    >
        {ui}
    </ViewportContext.Provider>
);

describe("DataTable - keyboard rows", () => {
    it("makes clickable rows focusable and opens them with Enter and Space", () => {
        const onRowClick = vi.fn();
        render(
            <DataTable
                columns={columns}
                data={data}
                mode="table"
                onRowClick={onRowClick}
                rowProps={(row) => ({ "data-testid": `row-${row.id}` })}
            />
        );
        const row = screen.getByTestId("row-2");
        expect(row.tagName).toBe("TR");
        expect(row.getAttribute("tabindex")).toBe("0");

        fireEvent.keyDown(row, { key: "Enter" });
        fireEvent.keyDown(row, { key: " " });
        expect(onRowClick).toHaveBeenCalledTimes(2);
        expect(onRowClick).toHaveBeenLastCalledWith(data[1], 1);
    });

    it("leaves rows out of the tab order without onRowClick", () => {
        render(<DataTable columns={columns} data={data} mode="table" rowProps={(row) => ({ "data-testid": `row-${row.id}` })} />);
        expect(screen.getByTestId("row-1").getAttribute("tabindex")).toBeNull();
    });

    it("ignores keys pressed on a control inside the row", () => {
        const onRowClick = vi.fn();
        render(<DataTable columns={columns} data={data} mode="table" selectable onRowClick={onRowClick} />);
        fireEvent.keyDown(screen.getByLabelText("select-row-1"), { key: "Enter" });
        expect(onRowClick).not.toHaveBeenCalled();
    });

    it("makes clickable cards focusable and opens them with Enter", () => {
        const onRowClick = vi.fn();
        render(
            <DataTable
                columns={columns}
                data={data}
                mode="cards"
                onRowClick={onRowClick}
                rowProps={(row, index) => ({ "data-testid": `card-${index}` })}
            />
        );
        const card = screen.getByTestId("card-0");
        expect(card.getAttribute("tabindex")).toBe("0");
        fireEvent.keyDown(card, { key: "Enter" });
        expect(onRowClick).toHaveBeenCalledWith(data[0], 0);
    });

    it("still accepts rowProps as a plain object", () => {
        render(<DataTable columns={columns} data={data} mode="table" rowProps={{ className: "row-extra" }} />);
        expect(screen.getByText("Alice").closest("tr").className).toContain("row-extra");
    });
});

describe("DataTable - auto mode follows the session viewport", () => {
    it("renders only the table on a desktop session", () => {
        const { container } = render(withViewport("desktop", <DataTable columns={columns} data={data} />));
        expect(container.querySelector("table")).not.toBeNull();
        expect(container.querySelector("table").className).not.toContain("hidden");
        expect(screen.getAllByText("Alice")).toHaveLength(1);
    });

    it("renders only the table on a tablet session", () => {
        const { container } = render(withViewport("tablet", <DataTable columns={columns} data={data} />));
        expect(container.querySelector("table")).not.toBeNull();
        expect(screen.getAllByText("Alice")).toHaveLength(1);
    });

    it("renders only the cards on a phone session", () => {
        const { container } = render(withViewport("mobile", <DataTable columns={columns} data={data} />));
        expect(container.querySelector("table")).toBeNull();
        expect(screen.getAllByText("Alice")).toHaveLength(1);
    });

    it("keeps the CSS switch without a ViewportProvider", () => {
        const { container } = render(<DataTable columns={columns} data={data} />);
        expect(container.querySelector("table").className).toContain("md:table");
        expect(screen.getAllByText("Alice")).toHaveLength(2);
    });

    it("lets an explicit mode win over the viewport", () => {
        const { container } = render(withViewport("mobile", <DataTable columns={columns} data={data} mode="table" />));
        expect(container.querySelector("table")).not.toBeNull();
    });
});
