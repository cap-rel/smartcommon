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
        expect(getByText("Envoi en attente...")).toBeTruthy();
    });

    it("does NOT show the pending badge in dataURL mode even if value has pendingId", () => {
        const { queryByText } = render(
            <SignaturePad
                name="sig"
                value={{ src: "X", signer: "", pendingId: "PID42" }}
                onChange={() => {}}
            />
        );
        expect(queryByText("Envoi en attente...")).toBeNull();
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
