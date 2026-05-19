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
    display: PropTypes.oneOf(["list", "count"]),
    type: PropTypes.oneOf(["photos", "videos", "audios", "files"]),
    labels: PropTypes.shape({
        empty: PropTypes.string,
        download: PropTypes.string,
        count: PropTypes.shape({
            photos: PropTypes.func,
            videos: PropTypes.func,
            audios: PropTypes.func,
            files: PropTypes.func,
        }),
    }),
    onDownload: PropTypes.func,
};
