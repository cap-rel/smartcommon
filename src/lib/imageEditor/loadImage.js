// Decode an image source into an ImageBitmap with EXIF orientation already
// applied, so the pipeline never works on a sideways phone photo.

import { createLogger } from "lib/utils";

const log = createLogger("imageEditor");

// Accepts an ImageBitmap (returned as-is), a Blob/File, or a URL string.
export const loadBitmap = async (source) => {
    if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
        return source;
    }

    let blob;
    if (typeof source === "string") {
        const res = await fetch(source);
        if (!res.ok) {
            log.error(`loadBitmap: fetch failed (${res.status}) for ${source}`);
            throw new Error(`imageEditor: cannot fetch image (${res.status})`);
        }
        blob = await res.blob();
    } else if (source instanceof Blob) {
        blob = source;
    } else {
        log.error("loadBitmap: unsupported source type", source);
        throw new Error("imageEditor: unsupported image source");
    }

    try {
        return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch (err) {
        // Older engines reject the options bag: retry without EXIF handling.
        log.warning("loadBitmap: EXIF-aware decode failed, retrying plain", err);
        return createImageBitmap(blob);
    }
};
