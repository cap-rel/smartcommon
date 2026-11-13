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

    itemProps: PropTypes.object,
    linkProps: PropTypes.object,
    iconProps: PropTypes.object,
    nameProps: PropTypes.object,
    sizeProps: PropTypes.object,
    downloadIconProps: PropTypes.object,
    listProps: PropTypes.object,
    countProps: PropTypes.object,
    emptyProps: PropTypes.object,
};

export const DEFAULT_LABELS = {
    empty: "No file",
    download: "Download",
    count: {
        photos: (n) => (n === 1 ? `${n} photo` : `${n} photos`),
        videos: (n) => (n === 1 ? `${n} video` : `${n} videos`),
        audios: (n) => (n === 1 ? `${n} audio` : `${n} audios`),
        files: (n) => (n === 1 ? `${n} file` : `${n} files`),
    },
};
