import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { orderBy as lodashOrderBy } from "lodash";

import { Button, Input, Spinner } from "lib/components";
import { twMerge } from "lib/utils";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

const SEARCH_DEBOUNCE_MS = 250;

// Stringify a single cell value for the case-insensitive search filter. We
// intentionally only consider primitive-ish values: render functions returning
// JSX cannot be reliably stringified, so search relies on the raw row value
// for that column key.
const cellToSearchString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return "";
        }
    }
    return String(value);
};

const matchesSearch = (row, columns, term) => {
    const needle = term.toLowerCase();
    for (const col of columns) {
        const haystack = cellToSearchString(row?.[col.key]).toLowerCase();
        if (haystack.includes(needle)) return true;
    }
    return false;
};

// Detect whether a click event originated inside an element marked with
// data-row-action. Used to skip onRowClick on interactive children.
const isRowActionTarget = (event) => {
    const t = event?.target;
    if (!t || typeof t.closest !== "function") return false;
    return Boolean(t.closest("[data-row-action]"));
};

const alignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
};

export const DataTable = (props) => {
    const {
        columns,
        data,
        keyField = "id",

        sortable = false,
        sortBy: sortByProp,
        onSortChange,

        pageSize = 25,
        page: pageProp,
        onPageChange,

        searchable = false,
        search: searchProp,
        onSearchChange,

        selectable = false,
        selectedKeys: selectedKeysProp,
        onSelectionChange,

        mode = "auto",
        loading = false,
        empty,
        onRowClick,

        labels: userLabels = {},

        containerProps = {},
        searchProps = {},
        tableProps = {},
        headerProps = {},
        headerCellProps = {},
        rowProps = {},
        cellProps = {},
        paginationProps = {},
        cardProps = {},
        selectionBarProps = {},
    } = props;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // ----- Sort (controlled or uncontrolled) -----
    const sortIsControlled = sortByProp !== undefined;
    const [internalSortBy, setInternalSortBy] = useState(null);
    const effectiveSortBy = sortIsControlled ? sortByProp : internalSortBy;

    const handleHeaderClick = useCallback((col) => {
        if (!col?.sortable) return;
        // In uncontrolled mode the sortable flag at the component level must
        // also be enabled; in controlled mode we always defer to the caller.
        if (!sortIsControlled && !sortable) return;

        const current = effectiveSortBy;
        let next;
        if (!current || current.key !== col.key) {
            next = { key: col.key, direction: "asc" };
        } else if (current.direction === "asc") {
            next = { key: col.key, direction: "desc" };
        } else {
            // asc -> desc -> asc (cycle, never disappears)
            next = { key: col.key, direction: "asc" };
        }

        if (!sortIsControlled) setInternalSortBy(next);
        onSortChange?.(next);
    }, [effectiveSortBy, onSortChange, sortIsControlled, sortable]);

    // ----- Search (controlled or uncontrolled) with debounce -----
    const searchIsControlled = searchProp !== undefined;
    const [internalSearchInput, setInternalSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Live (un-debounced) value shown in the input field. In controlled mode
    // we show the caller value directly; in uncontrolled mode we show our
    // internal buffer.
    const liveSearch = searchIsControlled ? (searchProp ?? "") : internalSearchInput;

    // Debounce - applies to both modes uniformly for the filtering step. In
    // controlled mode the parent has presumably already done its own
    // debouncing too, but the extra layer is harmless and keeps the data
    // path identical.
    const debounceRef = useRef(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(liveSearch);
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [liveSearch]);

    const handleSearchChange = useCallback((value) => {
        // Smartcommon <Input> forwards the parsed value (string). Plain HTML
        // <input> in test stubs also forwards a string. Coerce to be safe.
        const next = value == null ? "" : String(value);
        if (!searchIsControlled) setInternalSearchInput(next);
        onSearchChange?.(next);
    }, [onSearchChange, searchIsControlled]);

    // ----- Filter -> sort -----
    const filteredData = useMemo(() => {
        if (!searchable || !debouncedSearch.trim()) return data;
        const term = debouncedSearch.trim();
        return data.filter((row) => matchesSearch(row, columns, term));
    }, [data, columns, searchable, debouncedSearch]);

    const sortedData = useMemo(() => {
        if (!effectiveSortBy) return filteredData;
        // Only sort when the column exists and is flagged sortable. This
        // makes a stale controlled sortBy harmless.
        const col = columns.find((c) => c.key === effectiveSortBy.key);
        if (!col) return filteredData;
        return lodashOrderBy(
            filteredData,
            [effectiveSortBy.key],
            [effectiveSortBy.direction]
        );
    }, [filteredData, columns, effectiveSortBy]);

    // ----- Pagination -----
    const paginationEnabled = pageSize > 0;
    const totalPages = paginationEnabled
        ? Math.max(1, Math.ceil(sortedData.length / pageSize))
        : 1;

    const pageIsControlled = pageProp !== undefined;
    const [internalPage, setInternalPage] = useState(0);
    const rawPage = pageIsControlled ? pageProp : internalPage;
    // Clamp page into [0, totalPages-1] - protects against stale controlled
    // values after the dataset shrinks.
    const currentPage = Math.min(Math.max(0, rawPage || 0), totalPages - 1);

    const goToPage = useCallback((next) => {
        const clamped = Math.min(Math.max(0, next), totalPages - 1);
        if (!pageIsControlled) setInternalPage(clamped);
        onPageChange?.(clamped);
    }, [onPageChange, pageIsControlled, totalPages]);

    // Reset internal page when the filter shrinks the dataset below the
    // current page. Only do this in uncontrolled mode.
    useEffect(() => {
        if (pageIsControlled) return;
        if (internalPage > totalPages - 1) {
            setInternalPage(Math.max(0, totalPages - 1));
        }
    }, [totalPages, internalPage, pageIsControlled]);

    const visibleRows = useMemo(() => {
        if (!paginationEnabled) return sortedData;
        const start = currentPage * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, paginationEnabled, currentPage, pageSize]);

    // ----- Selection (controlled or uncontrolled) -----
    const selectionIsControlled = selectedKeysProp !== undefined;
    const [internalSelected, setInternalSelected] = useState([]);
    const selectedKeys = selectionIsControlled ? selectedKeysProp : internalSelected;
    const selectedSet = useMemo(() => new Set(selectedKeys || []), [selectedKeys]);

    const emitSelection = useCallback((nextKeys) => {
        if (!selectionIsControlled) setInternalSelected(nextKeys);
        onSelectionChange?.(nextKeys);
    }, [onSelectionChange, selectionIsControlled]);

    const toggleRow = useCallback((row) => {
        const id = row?.[keyField];
        if (id == null) return;
        const next = selectedSet.has(id)
            ? selectedKeys.filter((k) => k !== id)
            : [...(selectedKeys || []), id];
        emitSelection(next);
    }, [selectedKeys, selectedSet, keyField, emitSelection]);

    // Toggle header checkbox: affects only the currently visible (filtered +
    // paginated) rows, per spec. If every visible row is already selected,
    // we unselect those; otherwise we add them.
    const visibleIds = useMemo(
        () => visibleRows.map((r) => r?.[keyField]).filter((k) => k != null),
        [visibleRows, keyField]
    );
    const allVisibleSelected = visibleIds.length > 0
        && visibleIds.every((id) => selectedSet.has(id));

    const toggleAllVisible = useCallback(() => {
        if (allVisibleSelected) {
            const remove = new Set(visibleIds);
            emitSelection((selectedKeys || []).filter((k) => !remove.has(k)));
        } else {
            const merged = new Set([...(selectedKeys || []), ...visibleIds]);
            emitSelection(Array.from(merged));
        }
    }, [allVisibleSelected, visibleIds, selectedKeys, emitSelection]);

    // ----- Display mode -----
    // Render table and/or cards. "auto" renders both with Tailwind's md:
    // prefix toggling visibility - this avoids any JS media query.
    const renderTable = mode === "table" || mode === "auto";
    const renderCards = mode === "cards" || mode === "auto";
    const tableVisibilityClass = mode === "auto" ? "hidden md:table" : "table";
    const cardsVisibilityClass = mode === "auto" ? "md:hidden" : "";

    // ----- Row click handler -----
    const handleRowClick = useCallback((row, index, event) => {
        if (!onRowClick) return;
        if (isRowActionTarget(event)) return;
        onRowClick(row, index);
    }, [onRowClick]);

    // ----- Empty state -----
    const isEmpty = !loading && visibleRows.length === 0;
    const emptyContent = empty !== undefined ? empty : labels.empty;

    // ----- Render helpers -----
    const renderHeaderSortIndicator = (col) => {
        if (!col.sortable) return null;
        const active = effectiveSortBy && effectiveSortBy.key === col.key;
        if (!active) return <span aria-hidden className="ml-1 text-soft-text">^v</span>;
        return (
            <span
                aria-label={effectiveSortBy.direction === "asc"
                    ? labels.sortAscending : labels.sortDescending}
                className="ml-1 text-strong-text"
            >
                {effectiveSortBy.direction === "asc" ? "^" : "v"}
            </span>
        );
    };

    // Table-mode rows
    const tableRows = visibleRows.map((row, index) => {
        const id = row?.[keyField];
        const reactKey = id != null ? id : `__idx_${index}`;
        const isSelected = id != null && selectedSet.has(id);

        return (
            <tr
                key={reactKey}
                {...rowProps}
                onClick={(e) => handleRowClick(row, index, e)}
                className={twMerge(
                    "border-b border-border",
                    onRowClick ? "cursor-pointer hover:bg-medium-bg" : "",
                    isSelected ? "bg-primary/10" : "",
                    rowProps.className
                )}
            >
                {selectable && (
                    <td
                        data-row-action
                        className="px-3 py-2 w-8"
                    >
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row)}
                            aria-label={`select-row-${reactKey}`}
                        />
                    </td>
                )}
                {columns.map((col) => {
                    const value = row?.[col.key];
                    const content = col.render
                        ? col.render(row, { index })
                        : value;
                    return (
                        <td
                            key={col.key}
                            {...cellProps}
                            className={twMerge(
                                "px-3 py-2 text-sm text-strong-text",
                                alignClass(col.align),
                                col.cellClassName,
                                cellProps.className
                            )}
                        >
                            {content}
                        </td>
                    );
                })}
            </tr>
        );
    });

    // Cards-mode rows
    const cardRows = visibleRows.map((row, index) => {
        const id = row?.[keyField];
        const reactKey = id != null ? id : `__idx_${index}`;
        const isSelected = id != null && selectedSet.has(id);

        return (
            <div
                key={reactKey}
                {...rowProps}
                {...cardProps}
                onClick={(e) => handleRowClick(row, index, e)}
                className={twMerge(
                    "rounded-lg border border-border p-3 bg-medium-bg",
                    "flex flex-col gap-1",
                    onRowClick ? "cursor-pointer hover:brightness-soft" : "",
                    isSelected ? "ring-1 ring-primary" : "",
                    rowProps.className,
                    cardProps.className
                )}
            >
                {selectable && (
                    <label
                        data-row-action
                        className="flex items-center gap-2 text-sm text-strong-text"
                    >
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row)}
                            aria-label={`select-row-${reactKey}`}
                        />
                    </label>
                )}
                {columns.map((col) => {
                    const value = row?.[col.key];
                    const content = col.render
                        ? col.render(row, { index })
                        : value;
                    // Per spec: skip columns whose rendered content is
                    // null/undefined to keep cards compact.
                    if (content === null || content === undefined) return null;
                    return (
                        <div
                            key={col.key}
                            {...cellProps}
                            className={twMerge(
                                "flex justify-between gap-3 text-sm",
                                col.cellClassName,
                                cellProps.className
                            )}
                        >
                            <span className="text-medium-text">
                                {col.label}
                            </span>
                            <span
                                className={twMerge(
                                    "font-medium text-strong-text",
                                    alignClass(col.align)
                                )}
                            >
                                {content}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    });

    const selectionCount = selectedKeys ? selectedKeys.length : 0;

    return (
        <div
            data-component="DataTable"
            {...containerProps}
            className={twMerge(
                "w-full flex flex-col gap-3",
                containerProps.className
            )}
        >
            {searchable && (
                <Input
                    type="search"
                    name="datatable-search"
                    value={liveSearch}
                    onChange={handleSearchChange}
                    placeholder={labels.searchPlaceholder}
                    {...searchProps}
                />
            )}

            {selectable && selectionCount > 0 && (
                <div
                    role="status"
                    {...selectionBarProps}
                    className={twMerge(
                        "px-3 py-2 rounded-md bg-primary/10 text-sm text-primary",
                        selectionBarProps.className
                    )}
                >
                    {typeof labels.rowsSelected === "function"
                        ? labels.rowsSelected(selectionCount)
                        : labels.rowsSelected}
                </div>
            )}

            {/* Table mode */}
            {renderTable && (
                <div className={mode === "auto" ? "hidden md:block" : "block"}>
                    <table
                        {...tableProps}
                        className={twMerge(
                            "w-full border-collapse",
                            tableVisibilityClass,
                            tableProps.className
                        )}
                    >
                        <thead
                            {...headerProps}
                            className={twMerge(
                                "bg-medium-bg",
                                headerProps.className
                            )}
                        >
                            <tr>
                                {selectable && (
                                    <th
                                        data-row-action
                                        className="px-3 py-2 w-8 text-left"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={toggleAllVisible}
                                            aria-label="select-all-visible"
                                        />
                                    </th>
                                )}
                                {columns.map((col) => {
                                    const clickable = col.sortable
                                        && (sortIsControlled || sortable);
                                    return (
                                        <th
                                            key={col.key}
                                            {...headerCellProps}
                                            style={{
                                                ...(headerCellProps.style || {}),
                                                ...(col.width ? { width: col.width } : {}),
                                            }}
                                            onClick={clickable
                                                ? () => handleHeaderClick(col)
                                                : undefined}
                                            className={twMerge(
                                                "px-3 py-2 text-sm font-semibold text-strong-text",
                                                alignClass(col.align),
                                                clickable ? "cursor-pointer select-none" : "",
                                                col.headerClassName,
                                                headerCellProps.className
                                            )}
                                        >
                                            {col.label}
                                            {renderHeaderSortIndicator(col)}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={columns.length + (selectable ? 1 : 0)}
                                        className="py-8"
                                    >
                                        <div className="flex justify-center">
                                            <Spinner size={6} />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && isEmpty && (
                                <tr>
                                    <td
                                        colSpan={columns.length + (selectable ? 1 : 0)}
                                        className="py-8 text-center text-sm text-medium-text"
                                    >
                                        {emptyContent}
                                    </td>
                                </tr>
                            )}
                            {!loading && !isEmpty && tableRows}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cards mode */}
            {renderCards && (
                <div
                    className={twMerge(
                        "flex flex-col gap-2",
                        cardsVisibilityClass
                    )}
                >
                    {loading && (
                        <div className="py-8 flex justify-center">
                            <Spinner size={6} />
                        </div>
                    )}
                    {!loading && isEmpty && (
                        <div className="py-8 text-center text-sm text-medium-text">
                            {emptyContent}
                        </div>
                    )}
                    {!loading && !isEmpty && cardRows}
                </div>
            )}

            {/* Pagination - hidden if the filtered set fits in one page. */}
            {paginationEnabled && totalPages > 1 && !loading && (
                <div
                    {...paginationProps}
                    className={twMerge(
                        "flex items-center justify-between gap-2 pt-2",
                        paginationProps.className
                    )}
                >
                    <Button
                        label={labels.previous}
                        disabled={currentPage <= 0}
                        onClick={() => goToPage(currentPage - 1)}
                    />
                    <span className="text-sm text-medium-text">
                        {labels.page} {currentPage + 1} {labels.of} {totalPages}
                    </span>
                    <Button
                        label={labels.next}
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => goToPage(currentPage + 1)}
                    />
                </div>
            )}
        </div>
    );
};

DataTable.propTypes = propTypes;
DataTable.defaultProps = defaultProps;

export { DEFAULT_LABELS } from "./props";
