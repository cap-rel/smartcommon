import { useEffect, useState } from "react";

// Resolves an image source (string URL, Blob, File) to a usable URL string.
// Handles createObjectURL/revokeObjectURL bookkeeping for Blobs and Files.
export const useImageUrl = (src) => {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!src) { setUrl(null); return undefined; }
        if (typeof src === "string") { setUrl(src); return undefined; }
        if (src instanceof Blob || src instanceof File) {
            const u = URL.createObjectURL(src);
            setUrl(u);
            return () => URL.revokeObjectURL(u);
        }
        setUrl(null);
        return undefined;
    }, [src]);
    return url;
};

// Generate a unique-ish id for new annotations. Consumers that already track
// stable ids (e.g. local_id from Dexie) should override this in onSave.
export const generateAnnotationId = () =>
    `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Distance between two touch points (used for pinch-to-zoom).
export const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
};

// Convert a client-space coordinate to a percentage relative to a DOM rect.
// Used to translate pointer events into annotation x/y values (0..100).
export const clientToPercent = (clientX, clientY, rect) => ({
    x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
    y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
});

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
