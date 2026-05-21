import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted mocks. These objects are referenced by the vi.mock factories
// below, so they must exist *before* the SignaturePad module evaluates.
// ---------------------------------------------------------------------------

const { padInstance, uploadMock, queueMock, locateMock } = vi.hoisted(() => ({
    padInstance: {
        on: () => {},
        off: () => {},
        clear: () => {},
        isEmpty: () => false,
        toDataURL: () => "data:image/png;base64,FAKE",
        toData: () => [],
        fromData: () => {},
    },
    uploadMock: {
        uploadFile: () => Promise.resolve({}),
        cancelUpload: () => Promise.resolve({}),
    },
    queueMock: {
        enqueue: () => Promise.resolve({ pending_id: "PID" }),
        pending: [],
        retry: () => Promise.resolve(),
        cancel: () => Promise.resolve(),
        flush: () => Promise.resolve(),
        onResolved: () => () => {},
    },
    locateMock: () => {},
}));

// signature_pad : provide a class that returns the shared padInstance so
// tests can inspect/override its methods. The constructor also captures
// the options passed by SignaturePad so we can drive onEnd if we want.
vi.mock("signature_pad", () => {
    return {
        default: class FakeSignaturePad {
            constructor(canvas, opts) {
                Object.assign(this, padInstance);
                this._opts = opts;
                this._canvas = canvas;
            }
        },
    };
});

// useUpload / useUploadQueue come from lib/hooks. Keep the rest of the
// barrel real (useField, useStates, useVariantMerger).
vi.mock("lib/hooks", async () => {
    const real = await vi.importActual("lib/hooks");
    return {
        ...real,
        useUpload: () => uploadMock,
        useUploadQueue: () => queueMock,
    };
});

// Stub Button + Input + Label primitives with HTML equivalents, same
// pattern as the LoginComponent test: the barrel cycle prevents the real
// Input/Button from rendering their inner element under Vitest.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Button: ({ icon: Icon, label, onClick, disabled, buttonProps = {}, ...rest }) => (
            <button
                type="button"
                disabled={disabled}
                onClick={onClick}
                data-testid={rest["data-testid"]}
                className={buttonProps.className}
            >
                {Icon ? <Icon /> : null}
                {label}
            </button>
        ),
        Input: ({ name, value, onChange, placeholder }) => (
            <input
                name={name}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
            />
        ),
        Label: ({ children }) => <div>{children}</div>,
    };
});

vi.mock("lib/utils/functions", async () => {
    const real = await vi.importActual("lib/utils/functions");
    return {
        ...real,
        locate: (...args) => locateMock(...args),
    };
});

vi.mock("react-hot-toast", () => {
    const fn = vi.fn();
    fn.success = vi.fn();
    fn.error = vi.fn();
    return { default: fn };
});

// happy-dom's HTMLCanvasElement has no useful getContext() or toBlob().
// Patch the prototype once for the whole file.
beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = function () {
        return { scale: () => {} };
    };
    HTMLCanvasElement.prototype.toBlob = function (cb) {
        cb(new Blob(["fake-png"], { type: "image/png" }));
    };
});

// Controllable ResizeObserver: tests that need to fire the callback
// drive it through resizeObserverState. happy-dom ships a no-op RO; we
// replace it so observe() captures the target + callback and the test
// can trigger size changes deterministically.
const resizeObserverState = {
    observed: [],
    callbacks: [],
};

beforeAll(() => {
    globalThis.ResizeObserver = class {
        constructor(cb) {
            this._cb = cb;
            resizeObserverState.callbacks.push(cb);
        }
        observe(el) {
            resizeObserverState.observed.push({ el, cb: this._cb });
        }
        unobserve(el) {
            resizeObserverState.observed = resizeObserverState.observed.filter(
                (o) => o.el !== el
            );
        }
        disconnect() {
            resizeObserverState.observed = resizeObserverState.observed.filter(
                (o) => o.cb !== this._cb
            );
            resizeObserverState.callbacks = resizeObserverState.callbacks.filter(
                (c) => c !== this._cb
            );
        }
    };
});

// Helper: pretend the canvas now reports a given (offsetWidth, offsetHeight),
// then fire every observed callback so the component reacts.
const fireResize = (width, height) => {
    for (const { el, cb } of resizeObserverState.observed) {
        Object.defineProperty(el, "offsetWidth", { configurable: true, value: width });
        Object.defineProperty(el, "offsetHeight", { configurable: true, value: height });
        cb([{ target: el, contentRect: { width, height } }]);
    }
};

import { SignaturePad } from "./index";

beforeEach(() => {
    padInstance.isEmpty = () => false;
    uploadMock.uploadFile = vi.fn(() => Promise.resolve({ upload_id: "U1" }));
    uploadMock.cancelUpload = vi.fn(() => Promise.resolve({ deleted: true }));
    queueMock.enqueue = vi.fn(() => Promise.resolve({ pending_id: "PID" }));
    queueMock.cancel = vi.fn(() => Promise.resolve());
    queueMock.onResolved = vi.fn(() => () => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Smoke / rendering
// ---------------------------------------------------------------------------

describe("SignaturePad - mode rendering", () => {
    it("renders in dataURL mode (default) with the Validate button hidden", () => {
        const { container } = render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        // Locate the Validate button via its FaSignature icon - in the
        // mocked Button stub we render the icon component child.
        const buttons = container.querySelectorAll("button");
        const validateBtn = Array.from(buttons).find((b) =>
            (b.className || "").includes("opacity-0")
        );
        expect(validateBtn).toBeTruthy();
    });

    it("renders in upload mode with the Validate button visible (no opacity-0)", () => {
        const { container } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "", signer: "", uploadId: null, pendingId: null }}
                onChange={() => {}}
            />
        );
        const buttons = container.querySelectorAll("button");
        const hiddenValidate = Array.from(buttons).find((b) =>
            (b.className || "").includes("opacity-0")
        );
        expect(hiddenValidate).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Pending badge visibility
// ---------------------------------------------------------------------------

describe("SignaturePad - pending badge", () => {
    it("shows the pending badge when value.pendingId is set in upload mode", () => {
        const { getByText } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "", signer: "", uploadId: null, pendingId: "PID42" }}
                onChange={() => {}}
            />
        );
        expect(getByText("Sending...")).toBeTruthy();
    });

    it("does NOT show the pending badge in dataURL mode even if value has pendingId", () => {
        const { queryByText } = render(
            <SignaturePad
                name="sig"
                value={{ src: "X", signer: "", pendingId: "PID42" }}
                onChange={() => {}}
            />
        );
        expect(queryByText("Sending...")).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Validate -> upload flow
// ---------------------------------------------------------------------------

describe("SignaturePad - validate / upload", () => {
    it("clicking Validate in upload mode calls uploadFile and writes uploadId into value", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "", signer: "", uploadId: null, pendingId: null }}
                onChange={onChange}
            />
        );

        // Find the validate button. In upload mode it carries the "success"
        // styling class we set in index.jsx.
        const validateBtn = Array.from(container.querySelectorAll("button"))
            .find((b) => (b.className || "").includes("text-success"));
        expect(validateBtn).toBeTruthy();

        await act(async () => { fireEvent.click(validateBtn); });

        await waitFor(() => expect(uploadMock.uploadFile).toHaveBeenCalled());

        const [blob, opts] = uploadMock.uploadFile.mock.calls[0];
        expect(blob).toBeInstanceOf(Blob);
        expect(opts.filename).toBe("signature.png");

        await waitFor(() => {
            const last = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
            expect(last?.uploadId).toBe("U1");
            expect(last?.pendingId).toBeNull();
            expect(last?.src).toContain("data:image/png");
        });
    });

    it("clicking Validate refuses to upload when the pad is empty", async () => {
        padInstance.isEmpty = () => true;
        const onChange = vi.fn();
        const { container } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "", signer: "", uploadId: null, pendingId: null }}
                onChange={onChange}
            />
        );
        const validateBtn = Array.from(container.querySelectorAll("button"))
            .find((b) => (b.className || "").includes("text-success"));

        await act(async () => { fireEvent.click(validateBtn); });

        expect(uploadMock.uploadFile).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Erase: cleanup of pending and staged uploads
// ---------------------------------------------------------------------------

describe("SignaturePad - erase / cancel", () => {
    it("erase in upload mode cancels a pending row in the queue", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                queue
                value={{ src: "X", signer: "Alice", uploadId: null, pendingId: "PID42" }}
                onChange={onChange}
            />
        );
        const eraseBtn = Array.from(container.querySelectorAll("button"))
            .find((b) => (b.className || "").includes("text-error"));
        expect(eraseBtn).toBeTruthy();

        await act(async () => { fireEvent.click(eraseBtn); });

        expect(queueMock.cancel).toHaveBeenCalledWith("PID42");
        const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
        expect(lastValue?.uploadId).toBeNull();
        expect(lastValue?.pendingId).toBeNull();
        expect(lastValue?.src).toBe("");
    });

    it("erase in upload mode best-effort cancels a server-side staged upload", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "X", signer: "", uploadId: "STAGED", pendingId: null }}
                onChange={onChange}
            />
        );
        const eraseBtn = Array.from(container.querySelectorAll("button"))
            .find((b) => (b.className || "").includes("text-error"));

        await act(async () => { fireEvent.click(eraseBtn); });

        expect(uploadMock.cancelUpload).toHaveBeenCalledWith("STAGED");
    });

    it("erase in legacy dataURL mode just clears value.src", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <SignaturePad
                name="sig"
                value={{ src: "DATAURL", signer: "" }}
                onChange={onChange}
            />
        );
        const eraseBtn = Array.from(container.querySelectorAll("button"))
            .find((b) => (b.className || "").includes("text-error"));

        await act(async () => { fireEvent.click(eraseBtn); });

        expect(uploadMock.cancelUpload).not.toHaveBeenCalled();
        expect(queueMock.cancel).not.toHaveBeenCalled();
        const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
        expect(lastValue?.src).toBe("");
        // uploadId/pendingId never appear in legacy mode value.
        expect(lastValue?.uploadId).toBeUndefined();
        expect(lastValue?.pendingId).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// onResolved subscription: queue resolves pending_id -> uploadId
// ---------------------------------------------------------------------------

describe("SignaturePad - onResolved subscription", () => {
    it("subscribes on mount when queue mode is on, and swaps pendingId -> uploadId", async () => {
        let capturedCallback = null;
        queueMock.onResolved = vi.fn((cb) => {
            capturedCallback = cb;
            return () => {};
        });

        const onChange = vi.fn();
        render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                queue
                value={{ src: "X", signer: "", uploadId: null, pendingId: "PID42" }}
                onChange={onChange}
            />
        );

        // Subscription was set up.
        expect(queueMock.onResolved).toHaveBeenCalled();
        expect(typeof capturedCallback).toBe("function");

        // Simulate the queue notifying that PID42 is now uploaded.
        await act(async () => {
            capturedCallback({ pending_id: "PID42", upload_id: "U42" });
        });

        const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
        expect(lastValue?.uploadId).toBe("U42");
        expect(lastValue?.pendingId).toBeNull();
        expect(lastValue?.src).toBe("X");
    });

    it("does NOT subscribe to the queue in legacy dataURL mode", () => {
        queueMock.onResolved = vi.fn(() => () => {});
        render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        expect(queueMock.onResolved).not.toHaveBeenCalled();
    });

    it("does NOT subscribe to the queue in upload mode without queue=true", () => {
        queueMock.onResolved = vi.fn(() => () => {});
        render(
            <SignaturePad
                name="sig"
                outputFormat="upload"
                value={{ src: "", signer: "", uploadId: null, pendingId: null }}
                onChange={() => {}}
            />
        );
        expect(queueMock.onResolved).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// ResizeObserver: bug "canvas mounted while parent display:none has a 0x0
// internal buffer, so drawing later does not show". The fix is to observe
// the canvas via ResizeObserver and re-size the internal buffer whenever
// the visible size changes (especially 0 -> real value).
// ---------------------------------------------------------------------------

describe("SignaturePad - resize handling (canvas mounted hidden then shown)", () => {
    beforeEach(() => {
        resizeObserverState.observed = [];
        resizeObserverState.callbacks = [];
        padInstance.toData = vi.fn(() => []);
        padInstance.fromData = vi.fn();
    });

    it("observes the canvas via ResizeObserver at mount", () => {
        const { container } = render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        const canvas = container.querySelector("canvas");
        expect(canvas).toBeTruthy();
        // The component must have called ResizeObserver.observe(canvas).
        const observed = resizeObserverState.observed.find((o) => o.el === canvas);
        expect(observed).toBeTruthy();
    });

    it("sizes the canvas internal buffer when the parent becomes visible (0 -> real size)", () => {
        const { container } = render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        const canvas = container.querySelector("canvas");
        // happy-dom has no layout: offsetWidth/Height are 0 by default,
        // which faithfully reproduces the production bug (parent hidden).
        expect(canvas.width).toBe(0);
        expect(canvas.height).toBe(0);

        // Parent becomes visible: offsetWidth/Height now report real values.
        // The fix must size canvas.width/height from these via the ResizeObserver
        // callback.
        act(() => fireResize(400, 200));

        // devicePixelRatio defaults to 1 in happy-dom.
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        expect(canvas.width).toBe(400 * ratio);
        expect(canvas.height).toBe(200 * ratio);
    });

    it("does NOT touch the canvas buffer if offsetWidth and offsetHeight are still 0", () => {
        const { container } = render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        const canvas = container.querySelector("canvas");

        // Force a manual non-zero buffer to detect accidental overwrites.
        canvas.width = 99;
        canvas.height = 99;

        // Still hidden: RO fires with (0, 0). The component must skip resizing.
        act(() => fireResize(0, 0));

        expect(canvas.width).toBe(99);
        expect(canvas.height).toBe(99);
    });

    it("preserves the existing drawing across a resize (toData then fromData)", () => {
        // Override BEFORE render: the fake SignaturePad copies methods
        // from padInstance via Object.assign at construction time, so
        // reassigning after render would not propagate to the live pad.
        const fakeStrokes = [{ points: [{ x: 1, y: 1 }] }];
        padInstance.toData = vi.fn(() => fakeStrokes);
        padInstance.fromData = vi.fn();

        render(
            <SignaturePad
                name="sig"
                value={{ src: "X", signer: "" }}
                onChange={() => {}}
            />
        );

        act(() => fireResize(400, 200));

        // The fix must snapshot the strokes before resizing and restore
        // them right after, so the user does not lose the in-progress
        // signature when the layout reflows.
        expect(padInstance.toData).toHaveBeenCalled();
        expect(padInstance.fromData).toHaveBeenCalledWith(fakeStrokes);
    });

    it("disconnects / unobserves on unmount (no leaked observer)", () => {
        const { container, unmount } = render(
            <SignaturePad
                name="sig"
                value={{ src: "", signer: "" }}
                onChange={() => {}}
            />
        );
        const canvas = container.querySelector("canvas");
        expect(
            resizeObserverState.observed.find((o) => o.el === canvas)
        ).toBeTruthy();

        unmount();

        expect(
            resizeObserverState.observed.find((o) => o.el === canvas)
        ).toBeFalsy();
    });
});
