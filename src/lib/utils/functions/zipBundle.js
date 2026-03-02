/**
 * Utilities for downloading and parsing ZIP bundles from SmartAuth's
 * ObjectDocumentController bundle endpoint.
 *
 * Supports both STORE (uncompressed) and DEFLATE (compressed) entries.
 */

/**
 * Decompress a DEFLATE-raw compressed ArrayBuffer using the browser's
 * built-in DecompressionStream API.
 *
 * @param {ArrayBuffer} compressedData - DEFLATE-compressed data
 * @returns {Promise<ArrayBuffer>} Decompressed data
 */
const decompressDeflateRaw = async (compressedData) => {
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(compressedData);
    writer.close();

    const chunks = [];
    let totalLength = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.byteLength;
    }

    const result = new Uint8Array(totalLength);
    let pos = 0;
    for (const chunk of chunks) {
        result.set(new Uint8Array(chunk.buffer || chunk), pos);
        pos += chunk.byteLength;
    }
    return result.buffer;
};

/**
 * Parse a ZIP file supporting STORE (method 0) and DEFLATE (method 8).
 * Returns a map of filename => ArrayBuffer for each file in the archive.
 *
 * @param {ArrayBuffer} arrayBuffer - Raw ZIP file data
 * @returns {Promise<Object>} Map of filename => ArrayBuffer
 */
export const parseZip = async (arrayBuffer) => {
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);

    // Find End of Central Directory record (signature 0x06054b50)
    let eocdOffset = -1;
    const searchStart = Math.max(0, bytes.length - 65558);
    for (let i = bytes.length - 22; i >= searchStart; i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            eocdOffset = i;
            break;
        }
    }
    if (eocdOffset === -1) {
        throw new Error("Invalid ZIP: End of Central Directory not found");
    }

    const cdEntries = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);

    const files = {};
    let offset = cdOffset;

    for (let i = 0; i < cdEntries; i++) {
        if (view.getUint32(offset, true) !== 0x02014b50) {
            throw new Error("Invalid ZIP: bad Central Directory entry signature");
        }

        const compressionMethod = view.getUint16(offset + 10, true);
        const compressedSize = view.getUint32(offset + 20, true);
        const filenameLen = view.getUint16(offset + 28, true);
        const extraLen = view.getUint16(offset + 30, true);
        const commentLen = view.getUint16(offset + 32, true);
        const localHeaderOffset = view.getUint32(offset + 42, true);

        const filename = new TextDecoder().decode(
            bytes.slice(offset + 46, offset + 46 + filenameLen)
        );

        // Read local file header to find actual data start
        const localFilenameLen = view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + localFilenameLen + localExtraLen;

        // Skip directory entries (size 0, typically ending with /)
        if (compressedSize > 0) {
            const rawData = arrayBuffer.slice(dataStart, dataStart + compressedSize);

            if (compressionMethod === 0) {
                // STORE - no compression
                files[filename] = rawData;
            } else if (compressionMethod === 8) {
                // DEFLATE - decompress
                files[filename] = await decompressDeflateRaw(rawData);
            } else {
                console.warn(`[parseZip] Unsupported compression method ${compressionMethod} for ${filename}, skipping`);
            }
        }

        // Advance to next Central Directory entry
        offset += 46 + filenameLen + extraLen + commentLen;
    }

    return files;
};

/**
 * Download a document bundle from the API and parse it.
 *
 * Sends a POST with share hashes to SmartAuth's ObjectDocumentController
 * bundle endpoint, receives a ZIP bundle containing a manifest.json and
 * the requested files.
 *
 * @param {Object} api - API instance (ky-compatible, from useApi)
 * @param {string[]} shares - Array of ECM share hashes to download
 * @param {Object} options
 * @param {number} [options.maxFileSize] - Max individual file size in bytes
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<Object>} { manifest, files: Map<share, Blob> }
 */
export const downloadBundle = async (api, shares, options = {}) => {
    const { maxFileSize, signal } = options;

    const body = { shares };
    if (maxFileSize) {
        body.max_file_size = maxFileSize;
    }

    const arrayBuffer = await api.post("object/documents/bundle", {
        json: body,
        signal,
    }).arrayBuffer();

    const zipFiles = await parseZip(arrayBuffer);

    // Parse manifest
    const manifestData = zipFiles["manifest.json"];
    if (!manifestData) {
        throw new Error("Bundle ZIP missing manifest.json");
    }
    const manifest = JSON.parse(new TextDecoder().decode(manifestData));

    // Convert file ArrayBuffers to Blobs with correct MIME types
    const files = new Map();
    for (const doc of manifest.included) {
        const fileData = zipFiles["files/" + doc.share];
        if (fileData) {
            files.set(doc.share, new Blob([fileData], { type: doc.mime_type }));
        }
    }

    return { manifest, files };
};
