import PropTypes from "prop-types";

const fileShape = PropTypes.oneOfType([
    PropTypes.instanceOf(globalThis.File ?? Object),
    PropTypes.shape({
        name: PropTypes.string,
        size: PropTypes.number,
        type: PropTypes.string,
        url: PropTypes.string,
    }),
]);

export const propTypes = {
    value: PropTypes.oneOfType([fileShape, PropTypes.arrayOf(fileShape)]),
    labels: PropTypes.shape({
        empty: PropTypes.string,
        download: PropTypes.string,
    }),
    onDownload: PropTypes.func,
};
