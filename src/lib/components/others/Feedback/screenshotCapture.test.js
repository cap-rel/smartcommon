import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock prepareScreenshot to avoid the real image pipeline (canvas etc.)
vi.mock("./feedbackPayload", () => ({
    prepareScreenshot: vi.fn(async (file) => file),
}));

import { captureScreen, canCaptureScreen } from "./screenshotCapture";

// Build a fake MediaStream with one video track.
const makeFakeStream = () => {
    const track = { stop: vi.fn(), kind: "video" };
    return {
        getTracks: () => [track],
    };
};

// Stub the video element: happy-dom does not implement play() / videoWidth
// / srcObject with a real MediaStream.
const stubVideoElement = (width = 1920, height = 1080) => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "video") {
            const el = originalCreateElement("video");
            // srcObject is a typed property in happy-dom; override with a
            // plain writable property so the fake stream can be assigned.
            Object.defineProperty(el, "srcObject", {
                value: null,
                writable: true,
                configurable: true,
            });
            Object.defineProperty(el, "videoWidth", { value: width, configurable: true });
            Object.defineProperty(el, "videoHeight", { value: height, configurable: true });
            el.play = vi.fn().mockResolvedValue(undefined);
            // Trigger onloadedmetadata on next tick.
            setTimeout(() => el.onloadedmetadata?.(), 0);
            return el;
        }
        if (tag === "canvas") {
            const el = originalCreateElement("canvas");
            el.getContext = vi.fn(() => ({ drawImage: vi.fn() }));
            el.toBlob = vi.fn((cb) => cb(new Blob(["png-bytes"], { type: "image/png" })));
            return el;
        }
        return originalCreateElement(tag);
    });
};

describe("canCaptureScreen", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        delete navigator.mediaDevices;
    });

    it("returns false when getDisplayMedia is not available", () => {
        expect(canCaptureScreen()).toBe(false);
    });

    it("returns true when getDisplayMedia is available", () => {
        Object.defineProperty(navigator, "mediaDevices", {
            value: { getDisplayMedia: vi.fn() },
            configurable: true,
        });
        expect(canCaptureScreen()).toBe(true);
    });
});

describe("captureScreen", () => {
    beforeEach(() => {
        stubVideoElement();
        vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
            setTimeout(cb, 0);
            return 1;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete navigator.mediaDevices;
    });

    it("returns null when getDisplayMedia is not available", async () => {
        const result = await captureScreen({});
        expect(result).toBeNull();
    });

    it("returns null when the user cancels the picker (NotAllowedError)", async () => {
        const stream = makeFakeStream();
        const getDisplayMedia = vi.fn().mockRejectedValue(
            Object.assign(new Error("denied"), { name: "NotAllowedError" })
        );
        Object.defineProperty(navigator, "mediaDevices", {
            value: { getDisplayMedia },
            configurable: true,
        });

        const result = await captureScreen({});
        expect(result).toBeNull();
        expect(getDisplayMedia).toHaveBeenCalled();
    });

    it("captures a frame and returns a File", async () => {
        const stream = makeFakeStream();
        const getDisplayMedia = vi.fn().mockResolvedValue(stream);
        Object.defineProperty(navigator, "mediaDevices", {
            value: { getDisplayMedia },
            configurable: true,
        });

        const result = await captureScreen({});

        expect(result).toBeInstanceOf(File);
        expect(result.type).toBe("image/png");
        // Tracks must be stopped after capture.
        expect(stream.getTracks()[0].stop).toHaveBeenCalled();
    });

    it("stops tracks and calls showModal even on error", async () => {
        // Restore the default stub first, then override with zero dimensions.
        vi.restoreAllMocks();
        stubVideoElement(0, 0);
        vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
            setTimeout(cb, 0);
            return 1;
        });

        const stream = makeFakeStream();
        const getDisplayMedia = vi.fn().mockResolvedValue(stream);
        Object.defineProperty(navigator, "mediaDevices", {
            value: { getDisplayMedia },
            configurable: true,
        });

        const showModal = vi.fn();
        const hideModal = vi.fn();

        await expect(captureScreen({ hideModal, showModal })).rejects.toThrow("no dimensions");

        expect(stream.getTracks()[0].stop).toHaveBeenCalled();
        expect(showModal).toHaveBeenCalled();
    });

    it("calls hideModal during capture and showModal after", async () => {
        const stream = makeFakeStream();
        const getDisplayMedia = vi.fn().mockResolvedValue(stream);
        Object.defineProperty(navigator, "mediaDevices", {
            value: { getDisplayMedia },
            configurable: true,
        });

        const hideModal = vi.fn();
        const showModal = vi.fn();

        await captureScreen({ hideModal, showModal });

        expect(hideModal).toHaveBeenCalled();
        expect(showModal).toHaveBeenCalled();
        // showModal must be called AFTER hideModal.
        const hideOrder = hideModal.mock.invocationCallOrder[0];
        const showOrder = showModal.mock.invocationCallOrder[0];
        expect(showOrder).toBeGreaterThan(hideOrder);
    });
});
