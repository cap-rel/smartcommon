import imageCompression from "browser-image-compression";

// Resize/compress an image while preserving EXIF metadata (orientation, GPS, etc.).
// Uses browser-image-compression which keeps EXIF for JPEG output.
//
// options:
//   - maxWidthOrHeight: longest side in pixels (default 1920)
//   - maxSizeMB: target max size in MB (default 2)
//   - quality: 0..1 (default 0.85) - mapped to initialQuality
//   - outputType: "base64" (default), "blob" or "file"
//
// Notes:
//   - To preserve EXIF, the output MUST stay JPEG. PNG would strip metadata.
//   - "file" wraps the compressed Blob into a File preserving the original
//     filename so server-side handlers see something sensible.
export const useFile = () => {
  const resizeImage = async (image, options = {}) => {
    const {
      maxWidthOrHeight = 1920,
      maxSizeMB = 2,
      quality = 0.85,
      outputType = "base64",
      // Backwards compat with previous API (react-image-file-resizer):
      maxWidth,
      maxHeight,
    } = options;

    const compressed = await imageCompression(image, {
      maxSizeMB,
      maxWidthOrHeight: maxWidthOrHeight ?? Math.max(maxWidth ?? 0, maxHeight ?? 0) ?? 1920,
      initialQuality: quality,
      useWebWorker: true,
      preserveExif: true,
      fileType: "image/jpeg",
    });

    if (outputType === "blob") {
      return compressed;
    }

    if (outputType === "file") {
      const baseName = (image?.name || "image").replace(/\.[^.]+$/, "");
      return new File([compressed], `${baseName}.jpg`, {
        type: compressed.type || "image/jpeg",
        lastModified: Date.now(),
      });
    }

    return imageCompression.getDataUrlFromFile(compressed);
  };

  return { resizeImage };
};
