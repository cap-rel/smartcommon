import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useUpload } from "./index";

// Mock useApi from lib/hooks. The hook only needs post() and del().
const apiMock = {
    post: vi.fn(),
    del: vi.fn(),
};

vi.mock("lib/hooks", () => ({
    useApi: () => apiMock,
}));

describe("useUpload", () => {
    beforeEach(() => {
        apiMock.post.mockReset();
        apiMock.del.mockReset();
    });

    it("uploads a single file as multipart/form-data on the default endpoint", async () => {
        apiMock.post.mockResolvedValueOnce({
            upload_id: "abc",
            filename: "photo.jpg",
            mime: "image/jpeg",
            size: 12,
            sha256: "deadbeef",
        });

        const { result } = renderHook(() => useUpload());
        const file = new File(["hello world!"], "photo.jpg", { type: "image/jpeg" });

        const out = await result.current.uploadFile(file);

        expect(apiMock.post).toHaveBeenCalledTimes(1);
        const [endpoint, options] = apiMock.post.mock.calls[0];
        expect(endpoint).toBe("upload");
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.get("file")).toBeInstanceOf(File);
        expect(out.upload_id).toBe("abc");
    });

    it("respects a custom endpoint", async () => {
        apiMock.post.mockResolvedValueOnce({ upload_id: "z" });
        const { result } = renderHook(() => useUpload({ endpoint: "custom/upload" }));
        const file = new File(["x"], "x.jpg", { type: "image/jpeg" });
        await result.current.uploadFile(file);
        expect(apiMock.post.mock.calls[0][0]).toBe("custom/upload");
    });

    it("uploads multiple files in parallel", async () => {
        apiMock.post
            .mockResolvedValueOnce({ upload_id: "a" })
            .mockResolvedValueOnce({ upload_id: "b" });

        const { result } = renderHook(() => useUpload());
        const f1 = new File(["1"], "1.jpg", { type: "image/jpeg" });
        const f2 = new File(["2"], "2.jpg", { type: "image/jpeg" });

        const out = await result.current.uploadFiles([f1, f2]);

        expect(out).toHaveLength(2);
        expect(out[0].upload_id).toBe("a");
        expect(out[1].upload_id).toBe("b");
        expect(apiMock.post).toHaveBeenCalledTimes(2);
    });

    it("throws when uploadFile is called without a file", async () => {
        const { result } = renderHook(() => useUpload());
        // uploadFile is async, so the throw becomes a rejected promise.
        await expect(result.current.uploadFile()).rejects.toThrow(/file is required/);
    });

    it("throws when uploadFiles is called with a non-iterable", () => {
        const { result } = renderHook(() => useUpload());
        expect(() => result.current.uploadFiles({})).toThrow(/array or FileList/);
    });

    it("DELETEs the staged upload via cancelUpload", async () => {
        apiMock.del.mockResolvedValueOnce({ deleted: true });
        const { result } = renderHook(() => useUpload());
        const out = await result.current.cancelUpload("abc/def");
        expect(apiMock.del).toHaveBeenCalledWith("upload/abc%2Fdef");
        expect(out.deleted).toBe(true);
    });

    it("rejects cancelUpload without an id", async () => {
        const { result } = renderHook(() => useUpload());
        expect(() => result.current.cancelUpload()).toThrow(/uploadId is required/);
    });

    it("appends the file under the 'file' key", async () => {
        apiMock.post.mockResolvedValueOnce({ upload_id: "x" });
        const { result } = renderHook(() => useUpload());
        const blob = new Blob(["data"], { type: "image/png" });
        await result.current.uploadFile(blob, { filename: "renamed.png" });
        const fd = apiMock.post.mock.calls[0][1].body;
        // happy-dom does not honor the third "filename" argument of
        // FormData.append() consistently, so we only assert the key
        // shape; the real browser/fetch path uses the override.
        expect(fd.has("file")).toBe(true);
    });
});
