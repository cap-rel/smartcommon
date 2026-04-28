import { useMemo } from "react";

import { useApi } from "lib/hooks";

/**
 * useUpload
 *
 * Hook for binary file uploads to the smartauth /upload endpoint.
 *
 * The endpoint stages each file into a per-user directory and returns
 * an opaque upload_id that the calling business module then references
 * from its own JSON payload (e.g. PUT /intervention/{id} with a
 * cover_image_upload_id field). The module's PHP controller consumes
 * the staged file via SmartAuth\Api\UploadHelper::consumeUpload().
 *
 * Returned API:
 *   - uploadFile(file, { onProgress, signal, ... })
 *       file: Blob | File
 *       returns: Promise<{ upload_id, filename, mime, size, sha256 }>
 *
 *   - uploadFiles(files, options)
 *       files: Array<Blob|File>
 *       returns: Promise<Array<uploadResult>>
 *       Each file is uploaded in parallel (Promise.all). For sequential
 *       uploads, call uploadFile() yourself in a for-of loop.
 *
 *   - cancelUpload(uploadId)
 *       returns: Promise<{ deleted: true }>
 *
 * The endpoint path is "upload" by default but can be overridden via
 * options.endpoint (e.g. when the host module re-exposes it).
 */
export const useUpload = (defaultOptions = {}) => {
    const api = useApi();

    return useMemo(() => {
        const endpoint = defaultOptions.endpoint ?? "upload";

        const uploadFile = async (file, options = {}) => {
            if (!file) {
                throw new Error("useUpload.uploadFile: file is required");
            }

            const formData = new FormData();
            // Single-file shape: server-side UploadController detects
            // the "file" key and returns a flat object. For arrays use
            // uploadFiles() below.
            const filename = options.filename ?? file.name ?? "upload.bin";
            formData.append("file", file, filename);

            const { onProgress: _onProgress, ...kyOptions } = options;

            // Note: ky does not expose XHR upload progress events; on
            // modern browsers the fetch API does not stream upload
            // progress either. onProgress is accepted for forward
            // compatibility but currently ignored. Document this in
            // ~/docs/UPLOAD_PWA.md.

            return api.post(endpoint, {
                body: formData,
                ...kyOptions,
            });
        };

        const uploadFiles = (files, options = {}) => {
            if (!Array.isArray(files) && !(files instanceof FileList)) {
                throw new Error("useUpload.uploadFiles: files must be an array or FileList");
            }
            const list = Array.from(files);
            return Promise.all(list.map(file => uploadFile(file, options)));
        };

        const cancelUpload = (uploadId) => {
            if (!uploadId) {
                throw new Error("useUpload.cancelUpload: uploadId is required");
            }
            return api.del(`${endpoint}/${encodeURIComponent(uploadId)}`);
        };

        return { uploadFile, uploadFiles, cancelUpload };
    }, [api, defaultOptions.endpoint]);
};
