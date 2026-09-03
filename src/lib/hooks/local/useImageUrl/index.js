import { useEffect, useState } from "react";

/**
 * Resolves an image source (string URL, Blob, File) to a usable URL string,
 * handling the createObjectURL / revokeObjectURL bookkeeping for Blobs and
 * Files. A string source is passed straight through - no state involved.
 *
 * Single home for what used to be four byte-identical copies of the same hook
 * (PhotoAnnotator, ConfirmStep, ProductGrid, CategoryGrid).
 *
 * @param {string|Blob|File|null|undefined} src
 * @returns {string|null} A URL usable as an <img> src, or null.
 */
export const useImageUrl = (src) => {
    const isBlob = src instanceof Blob || src instanceof File;
    const [objectUrl, setObjectUrl] = useState(null);

    // An object URL is a document-scoped resource: it MUST be created and
    // revoked in step with the mount, never during render (a render React
    // throws away would leak a URL nobody can revoke). Publishing the created
    // URL therefore requires a state write from the effect - the one shape
    // set-state-in-effect cannot distinguish from a gratuitous cascade.
    useEffect(() => {
        if (!isBlob) {
            return undefined;
        }

        const created = URL.createObjectURL(src);
        // oxlint-disable-next-line react/set-state-in-effect
        setObjectUrl(created);

        return () => {
            URL.revokeObjectURL(created);
        };
    }, [src, isBlob]);

    if (typeof src === "string") {
        return src;
    }

    return isBlob ? objectUrl : null;
};
