import PropTypes from "prop-types";

export const propTypes = {
    /** Left pane, usually a DataTable. */
    master: PropTypes.node,
    /** Right pane, shown when hasSelection. */
    detail: PropTypes.node,
    hasSelection: PropTypes.bool,
    /** Right pane while nothing is selected. */
    placeholder: PropTypes.node,
    /** Width classes of the master pane. */
    masterWidth: PropTypes.string,
    masterClassName: PropTypes.string,
    detailClassName: PropTypes.string,
    /** data-testid of the container; panes get -master and -detail. */
    testId: PropTypes.string,

    containerProps: PropTypes.object,
    masterProps: PropTypes.object,
    detailProps: PropTypes.object,
};

export const defaultProps = {
    hasSelection: false,
    masterWidth: "w-[56%] max-w-[860px]",
    masterClassName: "",
    detailClassName: "",
    testId: "desktop-split",
};
