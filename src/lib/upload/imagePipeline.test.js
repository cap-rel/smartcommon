import { describe, it, expect, vi, afterEach } from "vitest";

// The pipeline under test touches DOM APIs (canvas, Image, createImageBitmap):
// jsdom provides the DOM but not the canvas encoders, so the tests drive both
// the capability branch (WebP on/off) and the failure fallbacks with mocks.
// The `webp` option of convertImageForUpload forces the capability answer, keeping
// the module-level probe cache out of the picture.
import {
    canEncodeWebp,
    convertImageForUpload,
    downscaleImage,
    formatExifDate,
    parseExifDateTaken,
    readExifDateTaken,
    uploadRefusalReason,
} from "./imagePipeline";

const makeFile = (type = "image/jpeg", name = "plongee.jpg", parts = ["raw-bytes"]) =>
    new File(parts, name, { type, lastModified: 1700000000000 });

// Minimal TIFF payload: IFD0 with the Exif IFD pointer, Exif IFD with one
// ASCII date tag (DateTimeOriginal by default).
const buildTiff = (date, { little = true, tag = 0x9003 } = {}) => {
    const text = `${date}\0`;
    const exifIfd = 8 + 2 + 12 + 4;
    const dataOffset = exifIfd + 2 + 12 + 4;
    const buffer = new ArrayBuffer(dataOffset + text.length);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    bytes.set(little ? [0x49, 0x49] : [0x4d, 0x4d], 0);
    view.setUint16(2, 42, little);
    view.setUint32(4, 8, little);
    // IFD0: 1 entry, ExifIFDPointer (LONG).
    view.setUint16(8, 1, little);
    view.setUint16(10, 0x8769, little);
    view.setUint16(12, 4, little);
    view.setUint32(14, 1, little);
    view.setUint32(18, exifIfd, little);
    view.setUint32(22, 0, little);
    // Exif IFD: 1 entry, ASCII date.
    view.setUint16(exifIfd, 1, little);
    view.setUint16(exifIfd + 2, tag, little);
    view.setUint16(exifIfd + 4, 2, little);
    view.setUint32(exifIfd + 6, text.length, little);
    view.setUint32(exifIfd + 10, dataOffset, little);
    view.setUint32(exifIfd + 14, 0, little);
    for (let i = 0; i < text.length; i++) {
        bytes[dataOffset + i] = text.charCodeAt(i);
    }
    return bytes;
};

// SOI, APP0 (JFIF), APP1 (Exif + TIFF), SOS, a scan byte, EOI.
const buildJpeg = (date, options) => {
    const tiff = buildTiff(date, options);
    const exif = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff]);
    const app0 = [0xff, 0xe0, 0x00, 0x07, 0x4a, 0x46, 0x49, 0x46, 0x00];
    const app1Length = exif.length + 2;
    return new Uint8Array([
        0xff, 0xd8,
        ...app0,
        0xff, 0xe1, (app1Length >> 8) & 0xff, app1Length & 0xff, ...exif,
        0xff, 0xda, 0x00, 0x02, 0x00,
        0xff, 0xd9,
    ]);
};

const mockCanvas = (context, toBlob) => {
    const canvas = {
        width: 0,
        height: 0,
        getContext: () => context,
        toBlob: toBlob ?? ((cb) => cb(new Blob(["w"], { type: "image/webp" }))),
    };
    vi.spyOn(document, "createElement").mockReturnValue(canvas);
    return canvas;
};

const mockContext = () => ({ fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() });

describe("imagePipeline", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("canEncodeWebp", () => {
        it("answers a stable boolean", () => {
            expect(typeof canEncodeWebp()).toBe("boolean");
            expect(canEncodeWebp()).toBe(canEncodeWebp());
        });
    });

    describe("EXIF date", () => {
        it("reads DateTimeOriginal from a little-endian JPEG", () => {
            expect(parseExifDateTaken(buildJpeg("2026:07:14 09:32:05"))).toBe("2026-07-14 09:32:05");
        });

        it("reads DateTimeOriginal from a big-endian JPEG", () => {
            expect(parseExifDateTaken(buildJpeg("2025:12:31 23:59:59", { little: false }))).toBe("2025-12-31 23:59:59");
        });

        it("falls back to DateTimeDigitized", () => {
            expect(parseExifDateTaken(buildJpeg("2024:02:29 12:00:00", { tag: 0x9004 }))).toBe("2024-02-29 12:00:00");
        });

        it("ignores other tags (DateTime of IFD0 is the edit date)", () => {
            expect(parseExifDateTaken(buildJpeg("2024:02:29 12:00:00", { tag: 0x0132 }))).toBeNull();
        });

        it("finds the Exif payload inside a non-JPEG container (HEIC item)", () => {
            const tiff = buildTiff("2023:05:01 08:00:00");
            const heic = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 6, 0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]);
            expect(parseExifDateTaken(heic)).toBe("2023-05-01 08:00:00");
        });

        it("returns null without EXIF, on the zero placeholder and on garbage", () => {
            expect(parseExifDateTaken(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2, 0xff, 0xd9]))).toBeNull();
            expect(parseExifDateTaken(buildJpeg("0000:00:00 00:00:00"))).toBeNull();
            expect(parseExifDateTaken(new TextEncoder().encode("not an image"))).toBeNull();
            const truncated = buildJpeg("2026:07:14 09:32:05").slice(0, 30);
            expect(parseExifDateTaken(truncated)).toBeNull();
        });

        it("validates the date fields", () => {
            expect(formatExifDate("2026:13:01 00:00:00")).toBeNull();
            expect(formatExifDate("2026:01:01 24:00:00")).toBeNull();
            expect(formatExifDate("2026:01:01 10:20:30")).toBe("2026-01-01 10:20:30");
        });

        it("reads the date from a File, never from lastModified", async () => {
            const withExif = makeFile("image/jpeg", "image.jpg", [buildJpeg("2026:07:14 09:32:05")]);
            expect(await readExifDateTaken(withExif)).toBe("2026-07-14 09:32:05");
            expect(await readExifDateTaken(makeFile())).toBeNull();
        });
    });

    describe("convertImageForUpload", () => {
        it("keeps an accepted original when webp is unavailable, with its EXIF date", async () => {
            const file = makeFile("image/jpeg", "image.jpg", [buildJpeg("2026:07:14 09:32:05")]);
            const result = await convertImageForUpload(file, { webp: false });
            expect(result.file).toBe(file);
            expect(result.mime).toBe("image/jpeg");
            expect(result.width).toBe(0);
            expect(result.dateTaken).toBe("2026-07-14 09:32:05");
        });

        it("keeps the original when the server cannot read WebP", async () => {
            const createImageBitmap = vi.fn();
            vi.stubGlobal("createImageBitmap", createImageBitmap);
            const file = makeFile();
            const result = await convertImageForUpload(file, { webp: true, serverWebp: false });
            expect(result.file).toBe(file);
            expect(createImageBitmap).not.toHaveBeenCalled();
        });

        it("re-encodes a HEIC as JPEG when WebP is unavailable (Safari)", async () => {
            const bitmap = { width: 4032, height: 3024, close: vi.fn() };
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
            const toBlob = vi.fn((cb, type) => cb(new Blob(["j"], { type })));
            mockCanvas(mockContext(), toBlob);

            const result = await convertImageForUpload(makeFile("image/heic", "image.heic"), { webp: false });
            expect(toBlob).toHaveBeenCalledTimes(1);
            expect(toBlob.mock.calls[0][1]).toBe("image/jpeg");
            expect(result.mime).toBe("image/jpeg");
            expect(result.file.name).toBe("image.jpg");
            expect(result.width).toBe(2400);
            expect(result.height).toBe(1800);
        });

        it("re-encodes an oversized accepted file as JPEG when WebP is unavailable", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 100, height: 100 }));
            mockCanvas(mockContext(), (cb, type) => cb(new Blob(["j"], { type })));

            const big = makeFile("image/png", "scan.png", ["x".repeat(2048)]);
            const result = await convertImageForUpload(big, { webp: false, maxBytes: 1024 });
            expect(result.mime).toBe("image/jpeg");
            expect(result.file.name).toBe("scan.jpg");
        });

        it("falls back to JPEG when toBlob answers PNG for a file that must be converted", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 100, height: 100 }));
            const toBlob = vi.fn((cb, type) => cb(new Blob(["p"], { type: type === "image/webp" ? "image/png" : type })));
            mockCanvas(mockContext(), toBlob);

            const result = await convertImageForUpload(makeFile("image/heic", "image.heic"), { webp: true });
            expect(toBlob.mock.calls.map((c) => c[1])).toEqual(["image/webp", "image/jpeg"]);
            expect(result.mime).toBe("image/jpeg");
        });

        it("returns the original when the blob is PNG and the original is accepted", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 100, height: 100, close: vi.fn() }));
            mockCanvas(mockContext(), (cb) => cb(new Blob(["x"], { type: "image/png" })));

            const file = makeFile();
            const result = await convertImageForUpload(file, { webp: true });
            expect(result.file).toBe(file);
            expect(result.mime).toBe("image/jpeg");
        });

        it("never rejects: a decode failure returns the original", async () => {
            const file = makeFile("image/heic", "image.heic");
            vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("nope")));
            vi.stubGlobal("Image", class {
                set src(_value) {
                    this.onerror();
                }
            });

            const result = await convertImageForUpload(file, { webp: false });
            expect(result.file).toBe(file);
            expect(result.mime).toBe("image/heic");
        });

        it("resamples to the largest side and keeps the ratio", async () => {
            const bitmap = { width: 3000, height: 1500, close: vi.fn() };
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
            const canvas = mockCanvas(mockContext());

            const file = makeFile();
            const result = await convertImageForUpload(file, { maxSide: 2400, webp: true });

            expect(canvas.width).toBe(2400);
            expect(canvas.height).toBe(1200);
            expect(result.file.name).toBe("plongee.webp");
            expect(result.file.type).toBe("image/webp");
            expect(result.width).toBe(2400);
            expect(result.height).toBe(1200);
            expect(bitmap.close).toHaveBeenCalled();
        });

        it("keeps small images at their size", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 800, height: 600, close: vi.fn() }));
            const canvas = mockCanvas(mockContext());

            const result = await convertImageForUpload(makeFile(), { maxSide: 2400, webp: true });
            expect(canvas.width).toBe(800);
            expect(canvas.height).toBe(600);
            expect(result.mime).toBe("image/webp");
        });

        it("keeps the EXIF date of the original on the WebP result", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 10, height: 10 }));
            mockCanvas(mockContext());

            const file = makeFile("image/jpeg", "image.jpg", [buildJpeg("2026:07:14 09:32:05")]);
            const result = await convertImageForUpload(file, { webp: true });
            expect(result.mime).toBe("image/webp");
            expect(result.dateTaken).toBe("2026-07-14 09:32:05");
        });

        it("falls back to the original when the encoder returns nothing usable", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 100, height: 100 }));
            mockCanvas(mockContext(), (cb) => cb(null));

            const file = makeFile();
            const result = await convertImageForUpload(file, { webp: true });
            expect(result.file).toBe(file);
        });

        it("shrinks a heavy accepted JPEG when WebP is unavailable (Safari)", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 4032, height: 3024, close: vi.fn() }));
            const toBlob = vi.fn((cb, type) => cb(new Blob(["j"], { type })));
            mockCanvas(mockContext(), toBlob);

            const file = makeFile("image/jpeg", "image.jpg", [buildJpeg("2026:07:14 09:32:05")]);
            const result = await convertImageForUpload(file, { webp: false, targetBytes: 16 });
            expect(toBlob.mock.calls.map((c) => c[1])).toEqual(["image/jpeg"]);
            expect(result.file).not.toBe(file);
            expect(result.mime).toBe("image/jpeg");
            expect(result.width).toBe(2400);
            expect(result.dateTaken).toBe("2026-07-14 09:32:05");
        });

        it("keeps the original when the re-encode is not lighter", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 100, height: 100 }));
            mockCanvas(mockContext(), (cb, type) => cb(new Blob(["x".repeat(64)], { type })));

            const file = makeFile();
            const result = await convertImageForUpload(file, { webp: false, targetBytes: 4 });
            expect(result.file).toBe(file);
        });

        it("encodes again at 1600 px when the result is over the server limit", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 4000, height: 3000, close: vi.fn() }));
            const canvas = mockCanvas(mockContext());
            canvas.toBlob = (cb, type) => cb(new Blob([canvas.width > 1600 ? "x".repeat(64) : "j"], { type }));

            const result = await convertImageForUpload(makeFile("image/heic", "image.heic"), { webp: true, maxBytes: 32 });
            expect(result.mime).toBe("image/webp");
            expect(result.width).toBe(1600);
            expect(result.height).toBe(1200);
        });

        it("encodes again at 1600 px when the encoder gives up (memory)", async () => {
            const bitmap = { width: 4000, height: 3000, close: vi.fn() };
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
            const canvas = mockCanvas(mockContext());
            canvas.toBlob = (cb, type) => cb(canvas.width > 1600 ? null : new Blob(["j"], { type }));

            const result = await convertImageForUpload(makeFile("image/heic", "image.heic"), { webp: false });
            expect(result.mime).toBe("image/jpeg");
            expect(result.width).toBe(1600);
            expect(bitmap.close).toHaveBeenCalledTimes(1);
        });

        it("requires a file", async () => {
            await expect(convertImageForUpload(null)).rejects.toThrow(/required/);
        });
    });

    describe("uploadRefusalReason", () => {
        it("names the server refusal motive", () => {
            expect(uploadRefusalReason({ type: "image/heic", size: 10 })).toBe("heic");
            expect(uploadRefusalReason({ type: "image/gif", size: 10 })).toBe("bad-format");
            expect(uploadRefusalReason({ type: "image/jpeg", size: 2048 }, { maxBytes: 1024 })).toBe("too-large");
            expect(uploadRefusalReason({ type: "image/webp", size: 10 })).toBeNull();
            expect(uploadRefusalReason({ type: "image/png", size: 10 }, { acceptedMimes: ["image/jpeg"] })).toBe("bad-format");
        });
    });
    describe("downscaleImage", () => {
        it("bounds a full-resolution photo to maxSide and releases the bitmap", async () => {
            const bitmap = { width: 4032, height: 3024, close: vi.fn() };
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
            const context = mockContext();
            const canvas = mockCanvas(context, (cb, type) => cb(new Blob(["small"], { type })));
            const result = await downscaleImage(makeFile("image/jpeg", "caci.jpeg"), { maxSide: 2000 });
            expect(result.resized).toBe(true);
            expect(result.width).toBe(2000);
            expect(result.height).toBe(1500);
            expect(result.file.type).toBe("image/jpeg");
            expect(result.file.name).toBe("caci.jpg");
            expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 2000, 1500);
            expect(bitmap.close).toHaveBeenCalled();
            // Backing store released once encoded.
            expect(canvas.width).toBe(0);
        });

        it("returns a JPEG that already fits untouched", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1200, height: 900, close: vi.fn() }));
            const createElement = vi.spyOn(document, "createElement");
            const file = makeFile("image/jpeg", "caci.jpg");
            const result = await downscaleImage(file, { maxSide: 2000 });
            expect(result.file).toBe(file);
            expect(result.resized).toBe(false);
            expect(createElement).not.toHaveBeenCalledWith("canvas");
        });

        it("re-encodes a decodable HEIC as JPEG even when it fits", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 800, height: 600, close: vi.fn() }));
            mockCanvas(mockContext(), (cb, type) => cb(new Blob(["jpg"], { type })));
            const result = await downscaleImage(makeFile("image/heic", "IMG_0001.HEIC"));
            expect(result.file.type).toBe("image/jpeg");
            expect(result.file.name).toBe("IMG_0001.jpg");
            expect(result.resized).toBe(false);
        });

        it("answers null when the browser cannot decode the file", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("unsupported")));
            // The <img> fallback fails too (jsdom has no decoder).
            vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: vi.fn() });
            vi.stubGlobal("Image", class {
                set src(_v) {
                    setTimeout(() => this.onerror && this.onerror(), 0);
                }
            });
            expect(await downscaleImage(makeFile("image/heic", "IMG_0002.heic"))).toBeNull();
        });

        it("answers null when the encoder gives up", async () => {
            vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 5000, height: 4000, close: vi.fn() }));
            mockCanvas(mockContext(), (cb) => cb(null));
            expect(await downscaleImage(makeFile("image/jpeg", "big.jpg"))).toBeNull();
        });
    });
});
