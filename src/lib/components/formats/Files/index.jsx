import { FaFile, FaDownload } from "react-icons/fa6";
import { isNil, isArray } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { formatBytes } from "lib/utils";

import { propTypes } from "./props";

const DEFAULT_LABELS = {
    empty: "Aucun fichier",
    download: "Télécharger",
};

const fileEntry = (file) => {
    if (file instanceof File) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            isObjectUrl: true,
        };
    }
    return {
        name: file?.name ?? "",
        size: typeof file?.size === "number" ? file.size : null,
        type: file?.type ?? null,
        url: file?.url ?? null,
        isObjectUrl: false,
    };
};

export const Files = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Files", props);

    const {
        value,
        labels: labelsOverride,
        onDownload,
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...(labelsOverride ?? {}) };

    if (isNil(value) || (isArray(value) && value.length === 0)) {
        return (
            <div { ...mergeProps("empty", props => ({
                ...props,
                "data-component": "Files",
                className: `italic text-soft-text`,
            }))}>
                {labels.empty}
            </div>
        );
    }

    const files = (isArray(value) ? value : [value]).map(fileEntry);

    return (
        <ul { ...mergeProps("list", props => ({
            ...props,
            "data-component": "Files",
            className: `flex flex-col gap-app-xs`,
        }))}>
            {files.map((file, index) => {
                const sizeText = file.size != null ? formatBytes(file.size) : null;
                const handleClick = (event) => {
                    if (typeof onDownload === "function") {
                        onDownload(file, event);
                    }
                };

                const linkContent = (
                    <>
                        <FaFile { ...mergeProps("icon", props => ({
                            ...props,
                            className: `shrink-0`,
                        }))} />
                        <span { ...mergeProps("name", props => ({
                            ...props,
                            className: `truncate`,
                        }))}>
                            {file.name}
                        </span>
                        {sizeText && (
                            <span { ...mergeProps("size", props => ({
                                ...props,
                                className: `text-soft-text shrink-0`,
                            }))}>
                                ({sizeText})
                            </span>
                        )}
                        <FaDownload { ...mergeProps("downloadIcon", props => ({
                            ...props,
                            className: `ml-auto shrink-0`,
                        }))} />
                    </>
                );

                const itemClassName = `flex items-center gap-app-xs active:brightness-soft active:underline`;

                return (
                    <li key={`file-${index}`} { ...mergeProps("item", props => ({
                        ...props,
                        className: ``,
                    }))}>
                        {file.url
                            ?   <a
                                    href={file.url}
                                    download={file.name || true}
                                    onClick={handleClick}
                                    aria-label={`${labels.download} ${file.name}`}
                                    { ...mergeProps("link", props => ({
                                        ...props,
                                        className: itemClassName,
                                    }))}
                                >
                                    {linkContent}
                                </a>
                            :   <span { ...mergeProps("link", props => ({
                                    ...props,
                                    className: itemClassName,
                                }))}>
                                    {linkContent}
                                </span>
                        }
                    </li>
                );
            })}
        </ul>
    );
};

Files.propTypes = propTypes;
