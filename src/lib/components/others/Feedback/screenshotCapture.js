import { createLogger } from "lib/utils";
import { prepareScreenshot } from "./feedbackPayload";

const log = createLogger("FeedbackCapture");

// True when the browser can capture the screen (desktop Chrome/Edge/
// Firefox recent). Not available on mobile browsers, which is why the
// file picker is the primary path there.
export const canCaptureScreen = () =>
    typeof navigator !== "undefined"
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getDisplayMedia === "function";

// Capture the screen via getDisplayMedia. The modal must be hidden during
// the capture (otherwise the screenshot shows the modal itself), so the
// caller passes hideModal / showModal callbacks.
//
// Resolves with a File (already reduced by prepareScreenshot), or null
// when the user cancels the picker (NOT an error).
export const captureScreen = async ({ hideModal, showModal }) => {
    if (!canCaptureScreen()) {
        return null;
    }

    let stream;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "monitor" },
            audio: false,
        });
    } catch (err) {
        // User cancelled the picker: not an error.
        if (err?.name === "NotAllowedError" || err?.name === "AbortError") {
            log.info("screen capture cancelled by user");
            return null;
        }
        log.error("getDisplayMedia failed", err?.message);
        throw err;
    }

    // Always stop the tracks, even on failure below.
    const stopTracks = () => {
        for (const track of stream.getTracks()) {
            track.stop();
        }
    };

    try {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        // Hide the modal while the capture is live so the screenshot does
        // not show the report form on top of the problem.
        hideModal?.();

        // Wait until the video is actually playing and has a real frame.
        // The first frame can be black; wait for readyState >= 2 and a
        // couple of animation frames.
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(reject);
            };
            video.onerror = () => reject(new Error("video element error"));
            // Safety timeout: 5 seconds max.
            setTimeout(() => reject(new Error("video load timeout")), 5000);
        });

        // Give the decoder a couple of frames to produce real pixels.
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            throw new Error("captured video has no dimensions");
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, width, height);

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("canvas toBlob failed")), "image/png");
        });

        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" });

        // Reduce before returning (same pipeline as the file picker).
        return await prepareScreenshot(file);
    } finally {
        stopTracks();
        // Always show the modal again, even on error or cancel.
        showModal?.();
    }
};
