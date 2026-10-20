import { describe, it, expect } from "vitest";

import { buildXmpPacket, embedXmp, writeImageMetadata } from "./xmpMetadata";
import { convertImageForUpload } from "./imagePipeline";

// 2x2 images produced by ImageMagick / cwebp (metadata stripped).
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const JPEG = fromBase64("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAACAAIDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAVAQEBAAAAAAAAAAAAAAAAAAAHCP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AC9UAkf/2Q==");
const PNG = fromBase64("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAA1BMVEUzZswgIiSpAAAADElEQVQI12NgYGAAAAAEAAEnNCcKAAAAAElFTkSuQmCC");
const WEBP_LOSSY = fromBase64("UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoCAAIAAUAmJaACdLoB+AADsAD+7nZ//q0PlofLQ/c+/+QWlct3YAAA");
const WEBP_LOSSLESS_ALPHA = fromBase64("UklGRhwAAABXRUJQVlA4TA8AAAAvAUAAEAcQ/Y8CBiKi/wEA");

const METADATA = {
    title: "Façade nord",
    description: "Fissure <angle> & \"joint\"",
    keywords: ["chantier", " béton ", "chantier", ""],
};

const ascii = (bytes, start, length) => String.fromCharCode(...bytes.subarray(start, start + length));
const utf8 = (bytes) => new TextDecoder().decode(bytes);
const countOf = (haystack, needle) => haystack.split(needle).length - 1;

const indexOfBytes = (bytes, pattern, from = 0) => {
    for (let i = from; i <= bytes.length - pattern.length; i++) {
        let match = true;
        for (let j = 0; j < pattern.length; j++) {
            if (bytes[i + j] !== pattern[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            return i;
        }
    }
    return -1;
};

const riffChunks = (bytes) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunks = [];
    let offset = 12;
    while (offset + 8 <= bytes.length) {
        const size = view.getUint32(offset + 4, true);
        chunks.push({ fourcc: ascii(bytes, offset, 4), data: bytes.subarray(offset + 8, offset + 8 + size) });
        offset += 8 + size + (size % 2);
    }
    return chunks;
};

const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let k = 0; k < 8; k++) {
            crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
};

const pngChunks = (bytes) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunks = [];
    let offset = 8;
    while (offset + 12 <= bytes.length) {
        const length = view.getUint32(offset);
        chunks.push({
            type: ascii(bytes, offset + 4, 4),
            data: bytes.subarray(offset + 8, offset + 8 + length),
            crc: view.getUint32(offset + 8 + length),
            crcInput: bytes.subarray(offset + 4, offset + 8 + length),
        });
        offset += 12 + length;
    }
    return chunks;
};

describe("buildXmpPacket", () => {
    it("writes title, description and deduplicated keywords as Dublin Core", () => {
        const packet = buildXmpPacket(METADATA);
        expect(packet).toContain("<dc:title><rdf:Alt><rdf:li xml:lang=\"x-default\">Façade nord</rdf:li></rdf:Alt></dc:title>");
        expect(packet).toContain("Fissure &lt;angle&gt; &amp; &quot;joint&quot;");
        expect(packet).toContain("<dc:subject><rdf:Bag><rdf:li>chantier</rdf:li><rdf:li>béton</rdf:li></rdf:Bag></dc:subject>");
        expect(packet.startsWith("<?xpacket begin=\"\"")).toBe(true);
        expect(packet.endsWith("<?xpacket end=\"w\"?>")).toBe(true);
    });

    it("skips empty properties", () => {
        const packet = buildXmpPacket({ title: "Seul titre", description: "  ", keywords: [] });
        expect(packet).toContain("dc:title");
        expect(packet).not.toContain("dc:description");
        expect(packet).not.toContain("dc:subject");
    });

    it("returns null when there is nothing to write", () => {
        expect(buildXmpPacket({})).toBeNull();
        expect(buildXmpPacket({ title: " ", keywords: ["", null] })).toBeNull();
        expect(buildXmpPacket(undefined)).toBeNull();
    });

    it("drops characters XML 1.0 forbids", () => {
        expect(buildXmpPacket({ title: "a\u0001b\u0008c" })).toContain(">abc<");
    });
});

describe("embedXmp - JPEG", () => {
    const packet = buildXmpPacket(METADATA);

    it("inserts an XMP APP1 segment after JFIF and keeps the rest byte for byte", () => {
        const out = embedXmp(JPEG, packet);
        // SOI, APP0 JFIF (16 + 2 bytes), then the XMP APP1.
        const app0End = 2 + 2 + ((JPEG[4] << 8) | JPEG[5]);
        expect(out[app0End]).toBe(0xff);
        expect(out[app0End + 1]).toBe(0xe1);
        expect(ascii(out, app0End + 4, 29)).toBe("http://ns.adobe.com/xap/1.0/\0");
        const segmentLength = (out[app0End + 2] << 8) | out[app0End + 3];
        expect(utf8(out.subarray(app0End + 4 + 29, app0End + 2 + segmentLength))).toBe(packet);
        expect(out.subarray(app0End + 2 + segmentLength)).toEqual(JPEG.subarray(app0End));
    });

    it("replaces a previous XMP segment instead of adding a second one", () => {
        const once = embedXmp(JPEG, buildXmpPacket({ title: "Ancien" }));
        const twice = embedXmp(once, packet);
        expect(countOf(utf8(twice), "<x:xmpmeta")).toBe(1);
        expect(utf8(twice)).not.toContain("Ancien");
        expect(twice.length).toBe(embedXmp(JPEG, packet).length);
    });

    it("refuses a packet larger than a JPEG segment", () => {
        expect(embedXmp(JPEG, "x".repeat(70000))).toBeNull();
    });

    it("refuses a truncated JPEG", () => {
        expect(embedXmp(JPEG.subarray(0, 30), packet)).toBeNull();
    });
});

describe("embedXmp - WebP", () => {
    const packet = buildXmpPacket(METADATA);

    it("promotes a lossy VP8 file to the extended format with an XMP chunk", () => {
        const out = embedXmp(WEBP_LOSSY, packet);
        expect(ascii(out, 0, 4)).toBe("RIFF");
        expect(new DataView(out.buffer).getUint32(4, true)).toBe(out.length - 8);
        const chunks = riffChunks(out);
        expect(chunks.map((c) => c.fourcc)).toEqual(["VP8X", "VP8 ", "XMP "]);
        const vp8x = chunks[0].data;
        expect(vp8x[0]).toBe(0x04);
        // Canvas 2x2, stored minus one on 24 bits.
        expect([...vp8x.subarray(4, 10)]).toEqual([1, 0, 0, 1, 0, 0]);
        expect(chunks[1].data).toEqual(riffChunks(WEBP_LOSSY)[0].data);
        expect(utf8(chunks[2].data)).toBe(packet);
    });

    it("keeps the alpha flag of a lossless VP8L bitstream", () => {
        const chunks = riffChunks(embedXmp(WEBP_LOSSLESS_ALPHA, packet));
        expect(chunks.map((c) => c.fourcc)).toEqual(["VP8X", "VP8L", "XMP "]);
        expect(chunks[0].data[0]).toBe(0x04 | 0x10);
        expect([...chunks[0].data.subarray(4, 10)]).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("replaces the XMP chunk of an extended file", () => {
        const once = embedXmp(WEBP_LOSSY, buildXmpPacket({ title: "Ancien" }));
        const twice = embedXmp(once, packet);
        const chunks = riffChunks(twice);
        expect(chunks.map((c) => c.fourcc)).toEqual(["VP8X", "VP8 ", "XMP "]);
        expect(utf8(chunks[2].data)).toBe(packet);
        expect(new DataView(twice.buffer).getUint32(4, true)).toBe(twice.length - 8);
    });

    it("pads an odd-sized XMP chunk", () => {
        const odd = buildXmpPacket({ title: "a" }).length % 2 === 1 ? "a" : "ab";
        const out = embedXmp(WEBP_LOSSY, buildXmpPacket({ title: odd }));
        expect(out.length % 2).toBe(0);
        expect(new DataView(out.buffer).getUint32(4, true)).toBe(out.length - 8);
    });
});

describe("embedXmp - PNG", () => {
    const packet = buildXmpPacket(METADATA);

    it("inserts a valid iTXt chunk right after IHDR", () => {
        const chunks = pngChunks(embedXmp(PNG, packet));
        expect(chunks.map((c) => c.type)).toEqual(["IHDR", "iTXt", ...pngChunks(PNG).slice(1).map((c) => c.type)]);
        const itxt = chunks[1];
        expect(itxt.crc).toBe(crc32(itxt.crcInput));
        const prefix = "XML:com.adobe.xmp\0\0\0\0\0";
        expect(ascii(itxt.data, 0, prefix.length)).toBe(prefix);
        expect(utf8(itxt.data.subarray(prefix.length))).toBe(packet);
    });

    it("replaces a previous XMP chunk", () => {
        const twice = embedXmp(embedXmp(PNG, buildXmpPacket({ title: "Ancien" })), packet);
        expect(pngChunks(twice).filter((c) => c.type === "iTXt")).toHaveLength(1);
        expect(utf8(twice)).not.toContain("Ancien");
    });
});

describe("embedXmp - other inputs", () => {
    it("returns null for an unsupported format", () => {
        const gif = new TextEncoder().encode("GIF89a.......");
        expect(embedXmp(gif, buildXmpPacket(METADATA))).toBeNull();
    });

    it("accepts an ArrayBuffer", () => {
        expect(embedXmp(PNG.slice().buffer, buildXmpPacket(METADATA))).toBeInstanceOf(Uint8Array);
    });
});

describe("writeImageMetadata", () => {
    const fileOf = (bytes, type, name) => new File([bytes], name, { type, lastModified: 1700000000000 });

    it("returns a tagged copy with the same name, type and date", async () => {
        const source = fileOf(JPEG, "image/jpeg", "facade.jpg");
        const tagged = await writeImageMetadata(source, METADATA);
        expect(tagged).not.toBe(source);
        expect(tagged.name).toBe("facade.jpg");
        expect(tagged.type).toBe("image/jpeg");
        expect(tagged.lastModified).toBe(1700000000000);
        const bytes = new Uint8Array(await tagged.arrayBuffer());
        expect(indexOfBytes(bytes, new TextEncoder().encode("Façade nord"))).toBeGreaterThan(0);
    });

    it("returns the original file when there is nothing to write", async () => {
        const source = fileOf(JPEG, "image/jpeg", "facade.jpg");
        expect(await writeImageMetadata(source, { title: "" })).toBe(source);
    });

    it("returns the original file for an unsupported format", async () => {
        const source = fileOf(new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70]), "image/heic", "a.heic");
        expect(await writeImageMetadata(source, METADATA)).toBe(source);
    });
});

describe("convertImageForUpload - metadata option", () => {
    // A light accepted JPEG with WebP disabled is returned without re-encode:
    // the metadata step then runs on the original bytes.
    const light = () => new File([JPEG], "facade.jpg", { type: "image/jpeg", lastModified: 1700000000000 });

    it("writes the XMP into the returned file", async () => {
        const result = await convertImageForUpload(light(), { webp: false, metadata: METADATA });
        const bytes = new Uint8Array(await result.file.arrayBuffer());
        expect(result.mime).toBe("image/jpeg");
        expect(indexOfBytes(bytes, new TextEncoder().encode("<dc:title>"))).toBeGreaterThan(0);
    });

    it("leaves the file untouched without the option", async () => {
        const source = light();
        const result = await convertImageForUpload(source, { webp: false });
        expect(result.file).toBe(source);
    });

    it("sends the file without metadata when the tagged copy would exceed maxBytes", async () => {
        const source = light();
        const result = await convertImageForUpload(source, { webp: false, maxBytes: JPEG.length + 10, metadata: METADATA });
        expect(result.file).toBe(source);
    });
});
