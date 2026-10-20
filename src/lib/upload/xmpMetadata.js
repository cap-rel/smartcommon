// Client-side XMP writer: embeds a title, a caption and keywords into a JPEG,
// WebP or PNG file, without re-encoding the pixels.
//
// XMP (Dublin Core) is the metadata block every photo tool reads (Lightroom,
// digiKam, Windows Explorer, exiftool, Nextcloud...):
//   title       -> dc:title       (rdf:Alt, x-default)
//   description -> dc:description (rdf:Alt, x-default)
//   keywords    -> dc:subject     (rdf:Bag)
//
// Where the packet goes:
//   - JPEG: APP1 segment "http://ns.adobe.com/xap/1.0/", right after the
//     leading JFIF/Exif segments;
//   - WebP: "XMP " chunk of the extended format (VP8X, XMP flag), a simple
//     VP8/VP8L file being promoted to the extended format;
//   - PNG : iTXt chunk "XML:com.adobe.xmp", right after IHDR.
// Any XMP block already present is replaced, never duplicated.
//
// Contract:
//   buildXmpPacket(metadata)          -> string | null (null when nothing to write)
//   embedXmp(bytes, packet)           -> Uint8Array | null (null: unsupported or malformed file)
//   writeImageMetadata(file, metadata)-> Promise<File> (the original file on any failure, logged)
//
// metadata: { title?: string, description?: string, keywords?: string[] }

import { createLogger } from "lib/utils";

const log = createLogger("xmpMetadata");

const XMP_JPEG_HEADER = "http://ns.adobe.com/xap/1.0/\0";
const XMP_PNG_KEYWORD = "XML:com.adobe.xmp";
// JPEG segment length is a 16-bit field that counts itself.
const JPEG_MAX_SEGMENT_PAYLOAD = 0xffff - 2;
const WEBP_FLAG_XMP = 0x04;
const WEBP_FLAG_ALPHA = 0x10;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Characters XML 1.0 forbids, even escaped: C0 controls except tab, LF and
// CR, plus U+FFFE and U+FFFF.
const isValidXmlChar = (char) => {
    const code = char.charCodeAt(0);
    if (code < 0x20) {
        return code === 0x09 || code === 0x0a || code === 0x0d;
    }
    return code !== 0xfffe && code !== 0xffff;
};

const escapeXml = (value) =>
    Array.from(value)
        .filter(isValidXmlChar)
        .join("")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const cleanText = (value) => (value === null || value === undefined ? "" : String(value).trim());

const altProperty = (name, value) =>
    `   <${name}><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(value)}</rdf:li></rdf:Alt></${name}>`;

/**
 * XMP packet (Dublin Core title, description, subject) for the given metadata.
 * Empty values are skipped; keywords are trimmed and deduplicated.
 *
 * @param {{title?: string, description?: string, keywords?: string[]}} [metadata]
 * @returns {string|null} null when there is nothing to write
 */
export const buildXmpPacket = (metadata = {}) => {
    const title = cleanText(metadata?.title);
    const description = cleanText(metadata?.description);
    const keywords = [...new Set((Array.isArray(metadata?.keywords) ? metadata.keywords : [])
        .map(cleanText)
        .filter(Boolean))];

    const properties = [];
    if (title) {
        properties.push(altProperty("dc:title", title));
    }
    if (description) {
        properties.push(altProperty("dc:description", description));
    }
    if (keywords.length > 0) {
        const items = keywords.map((keyword) => `<rdf:li>${escapeXml(keyword)}</rdf:li>`).join("");
        properties.push(`   <dc:subject><rdf:Bag>${items}</rdf:Bag></dc:subject>`);
    }
    if (properties.length === 0) {
        return null;
    }

    // Empty "begin" means UTF-8 (XMP spec part 1, 7.3.2).
    return [
        "<?xpacket begin=\"\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?>",
        "<x:xmpmeta xmlns:x=\"adobe:ns:meta/\">",
        " <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">",
        "  <rdf:Description rdf:about=\"\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">",
        ...properties,
        "  </rdf:Description>",
        " </rdf:RDF>",
        "</x:xmpmeta>",
        "<?xpacket end=\"w\"?>",
    ].join("\n");
};

const concatBytes = (parts) => {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
};

const startsWith = (bytes, offset, ascii) => {
    if (offset + ascii.length > bytes.length) {
        return false;
    }
    for (let i = 0; i < ascii.length; i++) {
        if (bytes[offset + i] !== ascii.charCodeAt(i)) {
            return false;
        }
    }
    return true;
};

// ---------------------------------------------------------------- JPEG

const embedInJpeg = (bytes, xmp) => {
    const header = encoder.encode(XMP_JPEG_HEADER);
    if (header.length + xmp.length > JPEG_MAX_SEGMENT_PAYLOAD) {
        log.warning("embedXmp: XMP packet too large for a JPEG APP1 segment", xmp.length);
        return null;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    // Marker segments up to the start of scan; the scan data and everything
    // after are copied as-is.
    const segments = [];
    let offset = 2;
    let scanStart = -1;
    while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xff) {
            log.warning("embedXmp: malformed JPEG marker", offset);
            return null;
        }
        const marker = bytes[offset + 1];
        if (marker === 0xff) {
            // Fill byte before a marker: dropped.
            offset += 1;
            continue;
        }
        if (marker === 0xda || marker === 0xd9) {
            scanStart = offset;
            break;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            segments.push({ marker, start: offset, end: offset + 2 });
            offset += 2;
            continue;
        }
        const length = view.getUint16(offset + 2);
        if (length < 2 || offset + 2 + length > bytes.length) {
            log.warning("embedXmp: truncated JPEG segment", offset, length);
            return null;
        }
        segments.push({ marker, start: offset, end: offset + 2 + length });
        offset += 2 + length;
    }
    if (scanStart < 0) {
        log.warning("embedXmp: JPEG without start of scan");
        return null;
    }

    const isXmp = (segment) => segment.marker === 0xe1 && startsWith(bytes, segment.start + 4, XMP_JPEG_HEADER);
    const isLeading = (segment) => segment.marker === 0xe0
        || (segment.marker === 0xe1 && startsWith(bytes, segment.start + 4, "Exif\0\0"));

    const kept = segments.filter((segment) => !isXmp(segment));
    let insertAt = 0;
    while (insertAt < kept.length && isLeading(kept[insertAt])) {
        insertAt++;
    }

    const segmentLength = 2 + header.length + xmp.length;
    const xmpSegment = new Uint8Array(2 + segmentLength);
    xmpSegment[0] = 0xff;
    xmpSegment[1] = 0xe1;
    xmpSegment[2] = segmentLength >> 8;
    xmpSegment[3] = segmentLength & 0xff;
    xmpSegment.set(header, 4);
    xmpSegment.set(xmp, 4 + header.length);

    const slice = (segment) => bytes.subarray(segment.start, segment.end);
    return concatBytes([
        bytes.subarray(0, 2),
        ...kept.slice(0, insertAt).map(slice),
        xmpSegment,
        ...kept.slice(insertAt).map(slice),
        bytes.subarray(scanStart),
    ]);
};

// ---------------------------------------------------------------- WebP

const riffChunk = (fourcc, data) => {
    const padded = data.length + (data.length % 2);
    const chunk = new Uint8Array(8 + padded);
    chunk.set(encoder.encode(fourcc), 0);
    new DataView(chunk.buffer).setUint32(4, data.length, true);
    chunk.set(data, 8);
    return chunk;
};

// Canvas size and alpha of a simple-format bitstream, needed to build the
// VP8X header. Null when the bitstream header is not recognized.
const readWebpBitstreamInfo = (fourcc, data) => {
    if (fourcc === "VP8 ") {
        if (data.length < 10 || data[3] !== 0x9d || data[4] !== 0x01 || data[5] !== 0x2a) {
            return null;
        }
        return {
            width: (data[6] | (data[7] << 8)) & 0x3fff,
            height: (data[8] | (data[9] << 8)) & 0x3fff,
            alpha: false,
        };
    }
    if (fourcc === "VP8L") {
        if (data.length < 5 || data[0] !== 0x2f) {
            return null;
        }
        const bits = (data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24)) >>> 0;
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >>> 14) & 0x3fff) + 1,
            alpha: ((bits >>> 28) & 1) === 1,
        };
    }
    return null;
};

const embedInWebp = (bytes, xmp) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const riffEnd = Math.min(bytes.length, 8 + view.getUint32(4, true));

    const chunks = [];
    let offset = 12;
    while (offset + 8 <= riffEnd) {
        const fourcc = decoder.decode(bytes.subarray(offset, offset + 4));
        const size = view.getUint32(offset + 4, true);
        const dataEnd = offset + 8 + size;
        if (dataEnd > riffEnd) {
            log.warning("embedXmp: truncated WebP chunk", fourcc, offset, size);
            return null;
        }
        chunks.push({ fourcc, data: bytes.subarray(offset + 8, dataEnd) });
        offset = dataEnd + (size % 2);
    }
    if (chunks.length === 0) {
        log.warning("embedXmp: WebP without chunks");
        return null;
    }

    let out;
    if (chunks[0].fourcc === "VP8X") {
        const vp8x = new Uint8Array(chunks[0].data);
        if (vp8x.length < 10) {
            log.warning("embedXmp: malformed WebP VP8X chunk", vp8x.length);
            return null;
        }
        vp8x[0] |= WEBP_FLAG_XMP;
        out = [
            riffChunk("VP8X", vp8x),
            ...chunks.slice(1).filter((chunk) => chunk.fourcc !== "XMP ").map((chunk) => riffChunk(chunk.fourcc, chunk.data)),
            riffChunk("XMP ", xmp),
        ];
    } else {
        // Simple format: a single VP8/VP8L bitstream. Promote it to the
        // extended format, which is the only one able to carry metadata.
        const info = readWebpBitstreamInfo(chunks[0].fourcc, chunks[0].data);
        if (!info || info.width < 1 || info.height < 1) {
            log.warning("embedXmp: unrecognized WebP bitstream", chunks[0].fourcc);
            return null;
        }
        const vp8x = new Uint8Array(10);
        vp8x[0] = WEBP_FLAG_XMP | (info.alpha ? WEBP_FLAG_ALPHA : 0);
        const width = info.width - 1;
        const height = info.height - 1;
        vp8x.set([width & 0xff, (width >> 8) & 0xff, (width >> 16) & 0xff], 4);
        vp8x.set([height & 0xff, (height >> 8) & 0xff, (height >> 16) & 0xff], 7);
        out = [
            riffChunk("VP8X", vp8x),
            ...chunks.map((chunk) => riffChunk(chunk.fourcc, chunk.data)),
            riffChunk("XMP ", xmp),
        ];
    }

    const body = concatBytes(out);
    const header = new Uint8Array(12);
    header.set(encoder.encode("RIFF"), 0);
    new DataView(header.buffer).setUint32(4, 4 + body.length, true);
    header.set(encoder.encode("WEBP"), 8);
    return concatBytes([header, body]);
};

// ---------------------------------------------------------------- PNG

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

let crcTable = null;

const crc32 = (parts) => {
    if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            crcTable[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (const part of parts) {
        for (let i = 0; i < part.length; i++) {
            crc = crcTable[(crc ^ part[i]) & 0xff] ^ (crc >>> 8);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
    const typeBytes = encoder.encode(type);
    const chunk = new Uint8Array(12 + data.length);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, data.length);
    chunk.set(typeBytes, 4);
    chunk.set(data, 8);
    view.setUint32(8 + data.length, crc32([typeBytes, data]));
    return chunk;
};

const embedInPng = (bytes, xmp) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunks = [];
    let offset = PNG_SIGNATURE.length;
    while (offset + 12 <= bytes.length) {
        const length = view.getUint32(offset);
        const type = decoder.decode(bytes.subarray(offset + 4, offset + 8));
        const end = offset + 12 + length;
        if (end > bytes.length) {
            log.warning("embedXmp: truncated PNG chunk", type, offset, length);
            return null;
        }
        chunks.push({ type, start: offset, end, dataStart: offset + 8 });
        offset = end;
        if (type === "IEND") {
            break;
        }
    }
    if (chunks.length === 0 || chunks[0].type !== "IHDR") {
        log.warning("embedXmp: PNG without IHDR");
        return null;
    }

    const isXmp = (chunk) => chunk.type === "iTXt" && startsWith(bytes, chunk.dataStart, `${XMP_PNG_KEYWORD}\0`);

    // iTXt: keyword, NUL, compression flag 0, method 0, empty language tag
    // and translated keyword (each NUL-terminated), then the UTF-8 text.
    const prefix = encoder.encode(`${XMP_PNG_KEYWORD}\0\0\0\0\0`);
    const xmpChunk = pngChunk("iTXt", concatBytes([prefix, xmp]));

    const slice = (chunk) => bytes.subarray(chunk.start, chunk.end);
    return concatBytes([
        bytes.subarray(0, PNG_SIGNATURE.length),
        slice(chunks[0]),
        xmpChunk,
        ...chunks.slice(1).filter((chunk) => !isXmp(chunk)).map(slice),
    ]);
};

// ---------------------------------------------------------------- public API

const detectFormat = (bytes) => {
    if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        return "jpeg";
    }
    if (bytes.length >= 12 && startsWith(bytes, 0, "RIFF") && startsWith(bytes, 8, "WEBP")) {
        return "webp";
    }
    if (bytes.length >= PNG_SIGNATURE.length && PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)) {
        return "png";
    }
    return null;
};

/**
 * Bytes of a JPEG, WebP or PNG image with the given XMP packet embedded,
 * any previous XMP block replaced. The pixel data is copied untouched.
 * Never throws.
 *
 * @param {ArrayBuffer|Uint8Array} input
 * @param {string} packet XMP packet, see buildXmpPacket
 * @returns {Uint8Array|null} null for an unsupported format or a malformed file
 */
export const embedXmp = (input, packet) => {
    try {
        const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
        const xmp = encoder.encode(packet);
        const format = detectFormat(bytes);
        if (format === "jpeg") {
            return embedInJpeg(bytes, xmp);
        }
        if (format === "webp") {
            return embedInWebp(bytes, xmp);
        }
        if (format === "png") {
            return embedInPng(bytes, xmp);
        }
        log.warning("embedXmp: unsupported image format");
        return null;
    } catch (e) {
        // Truncated structure (RangeError from DataView).
        log.warning("embedXmp: malformed image", e?.message);
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
 * Copy of a JPEG, WebP or PNG file carrying the title, caption and keywords
 * as XMP (Dublin Core). Same name, mime and lastModified as the source.
 *
 * NEVER throws and never loses the photo: when there is nothing to write, or
 * the format is unsupported (HEIC, GIF...) or unreadable, the original file is
 * returned (and the reason logged).
 *
 * @param {File} file
 * @param {{title?: string, description?: string, keywords?: string[]}} metadata
 * @returns {Promise<File>}
 */
export const writeImageMetadata = async (file, metadata) => {
    if (!file) {
        log.error("writeImageMetadata: file is required");
        return file;
    }
    const packet = buildXmpPacket(metadata);
    if (!packet) {
        return file;
    }
    try {
        const tagged = embedXmp(await readBytes(file), packet);
        if (!tagged) {
            log.warning("writeImageMetadata: metadata not written, original kept", file.name, file.type);
            return file;
        }
        return new File([tagged], file.name || "photo", {
            type: file.type,
            lastModified: file.lastModified || Date.now(),
        });
    } catch (e) {
        log.error("writeImageMetadata: read failed, original kept", file.name, e?.message);
        return file;
    }
};
