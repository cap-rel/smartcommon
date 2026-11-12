import PropTypes from "prop-types";

// Default labels are in English (source of truth). Translations live in
// `src/lib/locales/<lang>.js` and consumers override via the `labels` prop.
export const DEFAULT_LABELS = {
    empty: "No data to display",
    searchPlaceholder: "Search...",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    rowsSelected: (n) => `${n} row(s) selected`,
};

const columnShape = PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node,
    render: PropTypes.func,
    sortable: PropTypes.bool,
    width: PropTypes.string,
    align: PropTypes.oneOf(["left", "center", "right"]),
    headerClassName: PropTypes.string,
    cellClassName: PropTypes.string,
});

const sortByShape = PropTypes.shape({
    key: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(["asc", "desc"]).isRequired,
});

export const propTypes = {
    columns: PropTypes.arrayOf(columnShape).isRequired,
    data: PropTypes.array.isRequired,
    keyField: PropTypes.string,

    // Sorting
    sortable: PropTypes.bool,
    sortBy: sortByShape,
    onSortChange: PropTypes.func,

    // Pagination
    pageSize: PropTypes.number,
    page: PropTypes.number,
    onPageChange: PropTypes.func,

    // Search
    searchable: PropTypes.bool,
    search: PropTypes.string,
    onSearchChange: PropTypes.func,

    // Selection
    selectable: PropTypes.bool,
    selectedKeys: PropTypes.array,
    onSelectionChange: PropTypes.func,

    // Display
    // "auto": cards on a phone, table on a tablet or desktop, read from the
    // session viewport (ViewportProvider); without a provider, CSS md: switch.
    mode: PropTypes.oneOf(["auto", "table", "cards"]),
    loading: PropTypes.bool,
    empty: PropTypes.node,
    // (row, index): makes rows focusable (tabIndex 0) and opened by Enter
    // and Space as well as by a click.
    onRowClick: PropTypes.func,

    // i18n
    labels: PropTypes.object,

    // Styling slots
    containerProps: PropTypes.object,
    searchProps: PropTypes.object,
    tableProps: PropTypes.object,
    headerProps: PropTypes.object,
    headerCellProps: PropTypes.object,
    // Same props for every row, or (row, index) => props for per-row
    // attributes (data-testid...). Also applied to the cards.
    rowProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    cellProps: PropTypes.object,
    paginationProps: PropTypes.object,
    cardProps: PropTypes.object,
    selectionBarProps: PropTypes.object,
};

export const defaultProps = {
    keyField: "id",
    sortable: false,
    pageSize: 25,
    searchable: false,
    selectable: false,
    mode: "auto",
    loading: false,
    labels: {},
};
