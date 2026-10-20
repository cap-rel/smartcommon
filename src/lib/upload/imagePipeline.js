// Client-side image pipeline for uploads from a phone: read the shooting
// date from the ORIGINAL file, then re-encode the image before it leaves the
// device, under the limits the server announced.
//
// The decode goes through createImageBitmap(file, { imageOrientation: "from-image" })
// so the EXIF orientation is baked into the pixels; the re-encode then drops
// the metadata (EXIF included) by construction, which is why the shooting
// date is extracted first and returned next to the file (dateTaken).
//
// Target format of convertImageForUpload:
//   - WebP when the browser encodes it AND the server reads it (serverWebp);
//   - otherwise JPEG when the server would refuse the original (HEIC, unknown
//     mime, over maxBytes) or when the original is heavier than targetBytes
//     (Safari cannot encode WebP: without this an iPhone sends its 5 MB
//     camera JPEG untouched, too slow on a mobile uplink and over a 2M PHP
//     upload_max_filesize);
//   - the original as-is when it is accepted and already light.
// A result still over maxBytes is encoded again at FALLBACK_MAX_SIDE, as is a
// canvas the encoder could not serialize (memory pressure on low-end phones).
//
// Contract:
//   canEncodeWebp()                         -> boolean (canvas toDataURL probe)
//   parseExifDateTaken(bytes)               -> 'YYYY-MM-DD HH:MM:SS' | null
//   readExifDateTaken(file)                 -> Promise<'YYYY-MM-DD HH:MM:SS' | null>
//   convertImageForUpload(file, options?)   -> Promise<{ file, width, height, mime, dateTaken }>
//     - success: a WebP or JPEG File, or the original when no conversion is needed
//     - decode/encode failure: the ORIGINAL file untouched, never a rejected promise
//   uploadRefusalReason(file, limits?)      -> "heic" | "bad-format" | "too-large" | null
//
// Options of convertImageForUpload:
//   maxSide      : largest side in pixels, default 2400
//   quality      : encoder quality 0..1, default 0.9
//   webp         : forces the browser WebP capability answer (tests)
//   serverWebp   : false when the server cannot read WebP
//   acceptedMimes: mimes the server accepts, default jpeg/png/webp
//   maxBytes     : server size limit per file, default 10 MB
//   targetBytes  : weight above which an accepted original is shrunk anyway,
//                  default 2 MB
//   metadata     : { title?, description?, keywords? } written as XMP into the
//                  returned file (JPEG/WebP/PNG), see xmpMetadata.js; skipped
//                  when the tagged file would exceed maxBytes
//
//   downscaleImage(file, options?)     -> Promise<{ file, width, height, mime, resized } | null>
//     - bounds the pixels of any decodable image (documents, scanner input)
//     - null when the browser cannot decode the file (HEIC on Chrome)

import { createLogger } from "lib/utils";
import { writeImageMetadata } from "./xmpMetadata";

const log = createLogger("imagePipeline");

const DEFAULT_MAX_SIDE = 2400;
const DEFAULT_QUALITY = 0.9;
const FALLBACK_MAX_SIDE = 1600;
export const DEFAULT_TARGET_UPLOAD_BYTES = 2 * 1024 * 1024;
export const DEFAULT_ACCEPTED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// The APP1 segment sits in the first 64 KB of a JPEG; 256 KB leaves room for
// an APP0/ICC block before it.
const JPEG_HEAD_BYTES = 256 * 1024;
// Non-JPEG containers (HEIC) may store the Exif item anywhere: read the whole
// file, within reason.
const FULL_SCAN_MAX_BYTES = 32 * 1024 * 1024;

const TAG_EXIF_IFD = 0x8769;
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_DATE_TIME_DIGITIZED = 0x9004;
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"

let webpSupported = null;

// True when this browser can ENCODE WebP. Probed once per page load: the
// canvas toDataURL("image/webp") prefix is the standard capability probe.
export const canEncodeWebp = () => {
    if (webpSupported !== null) {
        return webpSupported;
    }
    try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        webpSupported = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    } catch (e) {
        webpSupported = false;
    }
    return webpSupported;
};

const matchesAt = (bytes, offset, pattern) => {
    if (offset < 0 || offset + pattern.length > bytes.length) {
        return false;
    }
    for (let i = 0; i < pattern.length; i++) {
        if (bytes[offset + i] !== pattern[i]) {
            return false;
        }
    }
    return true;
};

const isTiffHeader = (bytes, offset) =>
    matchesAt(bytes, offset, [0x49, 0x49, 0x2a, 0x00]) || matchesAt(bytes, offset, [0x4d, 0x4d, 0x00, 0x2a]);

// Offset of the TIFF header inside the APP1 "Exif" segment of a JPEG, -1 when
// the file has none. Walks the marker segments up to the start of scan.
const findJpegTiffOffset = (bytes, view) => {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xff) {
            return -1;
        }
        const marker = bytes[offset + 1];
        if (marker === 0xff) {
            // Fill byte before a marker.
            offset += 1;
            continue;
        }
        if (marker === 0xd9 || marker === 0xda) {
            // End of image / start of scan: no metadata after this point.
            return -1;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            // Standalone markers carry no length.
            offset += 2;
            continue;
        }
        const length = view.getUint16(offset + 2);
        if (length < 2) {
            return -1;
        }
        if (marker === 0xe1 && matchesAt(bytes, offset + 4, EXIF_HEADER) && isTiffHeader(bytes, offset + 10)) {
            return offset + 10;
        }
        offset += 2 + length;
    }
    return -1;
};

// Containers other than JPEG (HEIC/HEIF) keep the same "Exif\0\0" + TIFF
// payload inside an item: a byte scan finds it.
const scanTiffOffset = (bytes) => {
    const last = bytes.length - EXIF_HEADER.length - 4;
    for (let i = 0; i <= last; i++) {
        if (bytes[i] === 0x45 && matchesAt(bytes, i, EXIF_HEADER) && isTiffHeader(bytes, i + 6)) {
            return i + 6;
        }
    }
    return -1;
};

// 'YYYY:MM:DD HH:MM:SS' (EXIF) -> 'YYYY-MM-DD HH:MM:SS', the local wall-clock
// shape the server stores. Null for the "0000:00:00 00:00:00" placeholder and
// any out-of-range field.
export const formatExifDate = (raw) => {
    const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(String(raw || "").trim());
    if (!match) {
        return null;
    }
    const [, y, mo, d, h, mi, s] = match;
    const year = Number(y);
    const month = Number(mo);
    const day = Number(d);
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
        || Number(h) > 23 || Number(mi) > 59 || Number(s) > 59) {
        return null;
    }
    return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
};

// Read the shooting date out of a TIFF structure (EXIF payload).
const readDateFromTiff = (bytes, view, tiff) => {
    const byteOrder = view.getUint16(tiff);
    const little = byteOrder === 0x4949;
    if (!little && byteOrder !== 0x4d4d) {
        return null;
    }
    const u16 = (offset) => view.getUint16(offset, little);
    const u32 = (offset) => view.getUint32(offset, little);
    if (u16(tiff + 2) !== 42) {
        return null;
    }

    const findEntry = (ifd, tag) => {
        if (ifd + 2 > bytes.length) {
            return -1;
        }
        const count = u16(ifd);
        for (let i = 0; i < count; i++) {
            const entry = ifd + 2 + i * 12;
            if (entry + 12 > bytes.length) {
                return -1;
            }
            if (u16(entry) === tag) {
                return entry;
            }
        }
        return -1;
    };

    const readAscii = (entry) => {
        const type = u16(entry + 2);
        const count = u32(entry + 4);
        if (type !== 2 || count === 0 || count > 64) {
            return null;
        }
        const start = count <= 4 ? entry + 8 : tiff + u32(entry + 8);
        if (start + count > bytes.length) {
            return null;
        }
        let text = "";
        for (let i = 0; i < count; i++) {
            const code = bytes[start + i];
            if (code === 0) {
                break;
            }
            text += String.fromCharCode(code);
        }
        return text;
    };

    const ifd0 = tiff + u32(tiff + 4);
    const exifPointer = findEntry(ifd0, TAG_EXIF_IFD);
    if (exifPointer < 0) {
        return null;
    }
    const exifIfd = tiff + u32(exifPointer + 8);
    for (const tag of [TAG_DATE_TIME_ORIGINAL, TAG_DATE_TIME_DIGITIZED]) {
        const entry = findEntry(exifIfd, tag);
        if (entry >= 0) {
            const formatted = formatExifDate(readAscii(entry));
            if (formatted) {
                return formatted;
            }
        }
    }
    return null;
};

/**
 * Shooting date (EXIF DateTimeOriginal, DateTimeDigitized as a second choice)
 * of an image buffer, as a local wall-clock 'YYYY-MM-DD HH:MM:SS' string.
 * Null when the buffer carries none or is malformed; never throws.
 *
 * @param {ArrayBuffer|Uint8Array} input
 * @returns {string|null}
 */
export const parseExifDateTaken = (input) => {
    try {
        const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const isJpeg = bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8;
        const tiff = isJpeg ? findJpegTiffOffset(bytes, view) : scanTiffOffset(bytes);
        if (tiff < 0) {
            return null;
        }
        return readDateFromTiff(bytes, view, tiff);
    } catch (e) {
        // Truncated or corrupt structure (RangeError from DataView).
        return null;
    }
};

// Bytes of a Blob. jsdom and some old engines lack Blob.arrayBuffer().
const readBytes = (blob) => {
    if (typeof blob.arrayBuffer === "function") {
        return blob.arrayBuffer();
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("read failed"));
        reader.readAsArrayBuffer(blob);
    });
};

/**
 * Shooting date of the ORIGINAL file, read before any re-encode. Never
 * throws, never falls back on File.lastModified (the pick date on mobile).
 *
 * @param {Blob} file
 * @returns {Promise<string|null>}
 */
export const readExifDateTaken = async (file) => {
    if (!file || typeof file.slice !== "function") {
        return null;
    }
    try {
        const head = new Uint8Array(await readBytes(file.slice(0, JPEG_HEAD_BYTES)));
        const fromHead = parseExifDateTaken(head);
        const isJpeg = head.length >= 2 && head[0] === 0xff && head[1] === 0xd8;
        if (fromHead || isJpeg || file.size <= JPEG_HEAD_BYTES || file.size > FULL_SCAN_MAX_BYTES) {
            return fromHead;
        }
        return parseExifDateTaken(await readBytes(file));
    } catch (e) {
        return null;
    }
};

// Decode a File into a bitmap with its EXIF orientation applied. Falls back to
// an <img> element on browsers without createImageBitmap options (Safari < 15).
const decodeBitmap = async (file) => {
    if (typeof createImageBitmap === "function") {
        try {
            // "from-image": honor the EXIF orientation tag.
            return await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch (e) {
            // Some engines refuse the options bag for some formats: retry plain.
            try {
                return await createImageBitmap(file);
            } catch (e2) {
                // fall through to the <img> path
            }
        }
    }

    return await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            // CSS image-orientation handles the tag in every modern engine;
            // drawImage below reads the oriented pixels through it.
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("decode failed"));
        };
        img.src = url;
    });
};

// Largest-side resample keeping the aspect ratio.
const fittedSize = (width, height, maxSide) => {
    if (!maxSide || (width <= maxSide && height <= maxSide)) {
        return { width, height };
    }
    const scale = maxSide / Math.max(width, height);
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
};

const canvasToBlob = (canvas, type, quality) =>
    new Promise((resolve) => {
        canvas.toBlob(
            (blob) => resolve(blob),
            type,
            quality
        );
    });

const EXTENSION_BY_MIME = { "image/webp": "webp", "image/jpeg": "jpg" };

/**
 * Prepare a photo for upload: oriented, metadata-free WebP (or JPEG) when
 * possible, with its EXIF shooting date read from the original.
 *
 * NEVER throws for a given file and NEVER loses the photo: on any decode or
 * encode failure the original File is returned with its own mime; the caller
 * pre-checks it against the server limits.
 *
 * @param {File} file
 * @param {{maxSide?: number, quality?: number, webp?: boolean, serverWebp?: boolean,
 *          acceptedMimes?: string[], maxBytes?: number,
 *          metadata?: {title?: string, description?: string, keywords?: string[]}}} [options]
 * @returns {Promise<{file: File, width: number, height: number, mime: string, dateTaken: string|null}>}
 */
export const convertImageForUpload = async (file, options = {}) => {
    if (!file) {
        throw new Error("convertImageForUpload: file is required");
    }
    const result = await encodeForUpload(file, options);
    if (!options.metadata) {
        return result;
    }
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
    const tagged = await writeImageMetadata(result.file, options.metadata);
    if (tagged.size > maxBytes) {
        log.warning("convertImageForUpload: metadata would exceed maxBytes, file sent without it", file.name, tagged.size, maxBytes);
        return result;
    }
    return { ...result, file: tagged };
};

const encodeForUpload = async (file, options) => {
    const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE;
    const quality = options.quality ?? DEFAULT_QUALITY;
    const acceptedMimes = options.acceptedMimes ?? DEFAULT_ACCEPTED_IMAGE_MIMES;
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
    const targetBytes = Math.min(options.targetBytes ?? DEFAULT_TARGET_UPLOAD_BYTES, maxBytes);
    const browserWebp = options.webp ?? canEncodeWebp();
    const targetWebp = browserWebp && options.serverWebp !== false;

    // Read before the re-encode: the canvas drops every EXIF tag.
    const dateTaken = await readExifDateTaken(file);

    const mime = (file.type || "application/octet-stream").toLowerCase();
    const original = { file, width: 0, height: 0, mime, dateTaken };

    // The server would refuse the file as-is: HEIC, unknown mime, too big.
    const mustConvert = !acceptedMimes.includes(mime) || file.size > maxBytes;
    const shrink = file.size > targetBytes;
    if (!targetWebp && !mustConvert && !shrink) {
        return original;
    }

    try {
        const bitmap = await decodeBitmap(file);
        const sourceWidth = bitmap.width || bitmap.naturalWidth;
        const sourceHeight = bitmap.height || bitmap.naturalHeight;
        if (!sourceWidth || !sourceHeight) {
            log.warning("convertImageForUpload: decoded image has no size, original kept", file.name, mime);
            return original;
        }

        // A browser without a WebP encoder answers toBlob("image/webp") with a
        // PNG: detect it on the blob type, never trust the request.
        const attempts = targetWebp ? ["image/webp"] : [];
        if (mustConvert || shrink) {
            attempts.push("image/jpeg");
        }
        const sides = maxSide > FALLBACK_MAX_SIDE ? [maxSide, FALLBACK_MAX_SIDE] : [maxSide];

        try {
            for (const side of sides) {
                const { width, height } = fittedSize(sourceWidth, sourceHeight, side);
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext("2d");
                // White matte for formats without alpha: avoids black backgrounds in
                // some CMYK JPEG decoders, and transparent areas turning black in JPEG.
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, width, height);
                context.drawImage(bitmap, 0, 0, width, height);

                for (const type of attempts) {
                    const blob = await canvasToBlob(canvas, type, quality);
                    if (!blob || blob.type !== type || blob.size === 0 || blob.size > maxBytes) {
                        continue;
                    }
                    // A re-encode heavier than an acceptable original is no gain.
                    if (!mustConvert && blob.size >= file.size) {
                        return original;
                    }
                    const baseName = (file.name || "photo").replace(/\.[^.]+$/, "");
                    const converted = new File([blob], `${baseName}.${EXTENSION_BY_MIME[type]}`, {
                        type,
                        lastModified: file.lastModified || Date.now(),
                    });
                    return { file: converted, width, height, mime: type, dateTaken };
                }
            }
        } finally {
            if (typeof bitmap.close === "function") {
                bitmap.close();
            }
        }
        log.warning("convertImageForUpload: no encode fitted the limits, original kept", file.name, mime, file.size, maxBytes);
        return original;
    } catch (e) {
        log.warning("convertImageForUpload: decode/encode failed, original kept", file.name, mime, e?.message);
        return original;
    }
};

const DEFAULT_DOWNSCALE_MAX_SIDE = 2000;
// Mimes kept as-is when their pixels already fit: every browser and the
// server read them.
const PASSTHROUGH_MIMES = ["image/jpeg", "image/png"];

/**
 * Bound the pixels of an image before any heavy processing (document scanner,
 * OpenCV) or upload: a phone photo decoded at full resolution is what runs a
 * phone out of memory. The image is decoded once with its EXIF orientation,
 * drawn at maxSide on its longest side and re-encoded as JPEG; the bitmap is
 * released before returning.
 *
 * An image that already fits and is a JPEG/PNG comes back untouched.
 *
 * @param {File} file
 * @param {{maxSide?: number, quality?: number}} [options]
 * @returns {Promise<{file: File, width: number, height: number, mime: string, resized: boolean}|null>}
 *          null when the browser cannot decode the file or encode the result
 */
export const downscaleImage = async (file, options = {}) => {
    if (!file) {
        log.error("downscaleImage: file is required");
        return null;
    }
    const maxSide = options.maxSide ?? DEFAULT_DOWNSCALE_MAX_SIDE;
    const quality = options.quality ?? DEFAULT_QUALITY;
    const mime = (file.type || "").toLowerCase();

    let bitmap;
    try {
        bitmap = await decodeBitmap(file);
    } catch (e) {
        log.warning("downscaleImage: browser cannot decode", file.name, mime, e?.message);
        return null;
    }

    try {
        const sourceWidth = bitmap.width || bitmap.naturalWidth;
        const sourceHeight = bitmap.height || bitmap.naturalHeight;
        if (!sourceWidth || !sourceHeight) {
            log.warning("downscaleImage: decoded image has no size", file.name, mime);
            return null;
        }
        const { width, height } = fittedSize(sourceWidth, sourceHeight, maxSide);
        const fits = width === sourceWidth && height === sourceHeight;
        if (fits && PASSTHROUGH_MIMES.includes(mime)) {
            return { file, width, height, mime, resized: false };
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, "image/jpeg", quality);
        // Release the canvas backing store right away (iOS keeps it otherwise).
        canvas.width = 0;
        canvas.height = 0;
        if (!blob || blob.size === 0 || blob.type !== "image/jpeg") {
            log.error("downscaleImage: JPEG encode failed", file.name, width, height, blob?.type);
            return null;
        }
        const baseName = (file.name || "photo").replace(/\.[^.]+$/, "");
        const resized = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: file.lastModified || Date.now(),
        });
        return { file: resized, width, height, mime: "image/jpeg", resized: !fits };
    } catch (e) {
        log.error("downscaleImage: resize failed", file.name, mime, e?.message);
        return null;
    } finally {
        if (typeof bitmap.close === "function") {
            bitmap.close();
        }
    }
};

/**
 * Reason the server would refuse a file, checked on the client before the
 * upload so a refused file is reported with its real motive and never sent.
 * Codes: "heic" (HEIC/HEIF the server cannot read), "bad-format" (mime
 * not accepted), "too-large" (over maxBytes).
 *
 * @param {{type?: string, size?: number}} file
 * @param {{acceptedMimes?: string[], maxBytes?: number}} [limits]
 * @returns {string|null}
 */
export const uploadRefusalReason = (file, limits = {}) => {
    const acceptedMimes = limits.acceptedMimes ?? DEFAULT_ACCEPTED_IMAGE_MIMES;
    const maxBytes = limits.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
    const mime = String(file?.type || "").toLowerCase();
    if (mime === "image/heic" || mime === "image/heif") {
        return "heic";
    }
    if (!acceptedMimes.includes(mime)) {
        return "bad-format";
    }
    if ((file?.size ?? 0) > maxBytes) {
        return "too-large";
    }
    return null;
};
