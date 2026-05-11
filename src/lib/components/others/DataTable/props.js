import PropTypes from "prop-types";

// Default labels are in French; consumers can override via the `labels` prop
// (typically wired to their i18n translator). All accented characters are
// preserved on purpose - never strip them.
export const DEFAULT_LABELS = {
    empty: "Aucune donnée à afficher",
    searchPlaceholder: "Rechercher...",
    page: "Page",
    of: "sur",
    previous: "Précédent",
    next: "Suivant",
    sortAscending: "Tri ascendant",
    sortDescending: "Tri descendant",
    rowsSelected: (n) => `${n} ligne(s) sélectionnée(s)`,
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
    mode: PropTypes.oneOf(["auto", "table", "cards"]),
    loading: PropTypes.bool,
    empty: PropTypes.node,
    onRowClick: PropTypes.func,

    // i18n
    labels: PropTypes.object,

    // Styling slots
    containerProps: PropTypes.object,
    searchProps: PropTypes.object,
    tableProps: PropTypes.object,
    headerProps: PropTypes.object,
    headerCellProps: PropTypes.object,
    rowProps: PropTypes.object,
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
