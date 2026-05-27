import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { instances, capturedCb, formats } = vi.hoisted(() => ({
    instances: [],
    capturedCb: { successCallback: null },
    formats: {
        QR_CODE: 0,
        EAN_13: 1,
        EAN_8: 2,
        UPC_A: 3,
        UPC_E: 4,
        CODE_128: 5,
        CODE_39: 6,
    },
}));

vi.mock("html5-qrcode", () => {
    // Html5QrcodeScannerState: NOT_STARTED=1, SCANNING=2, PAUSED=3
    class FakeHtml5Qrcode {
        constructor(elementId, options) {
            this.elementId = elementId;
            this.options = options;
            this.state = 1; // NOT_STARTED until start() resolves
            this.start = vi.fn().mockImplementation((camera, config, onSuccess) => {
                this.state = 2; // SCANNING
                capturedCb.successCallback = onSuccess;
                return Promise.resolve();
            });
            this.stop = vi.fn().mockImplementation(() => {
                this.state = 1; // back to NOT_STARTED
                return Promise.resolve();
            });
            this.clear = vi.fn().mockResolvedValue(undefined);
            this.getState = vi.fn().mockImplementation(() => this.state);
            instances.push(this);
        }
    }
    return {
        Html5Qrcode: FakeHtml5Qrcode,
        Html5QrcodeSupportedFormats: formats,
    };
});

import { BarcodeScanner } from "./index";

describe("BarcodeScanner", () => {
    let originalVibrate;

    beforeAll(async () => {
        // Warm up the dynamic import so the first test doesn't pay the
        // module-resolution cost and time out on its waitFor().
        await import("html5-qrcode");
    });

    beforeEach(() => {
        instances.length = 0;
        capturedCb.successCallback = null;
        originalVibrate = navigator.vibrate;
        navigator.vibrate = vi.fn();
    });

    afterEach(() => {
        if (originalVibrate === undefined) {
            delete navigator.vibrate;
        } else {
            navigator.vibrate = originalVibrate;
        }
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("renders nothing when open is false", () => {
            const { container } = render(
                <BarcodeScanner open={false} onClose={() => {}} onScan={() => {}} />
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders title and close button when open", () => {
            render(<BarcodeScanner open onClose={() => {}} onScan={() => {}} />);
            expect(screen.getByText("Scan a code")).toBeDefined();
            expect(screen.getByLabelText("Close")).toBeDefined();
        });

        it("merges custom labels over defaults", () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    labels={{ title: "Scan QR", enterManually: "Type it" }}
                />
            );
            expect(screen.getByText("Scan QR")).toBeDefined();
            expect(screen.getByText("Type it")).toBeDefined();
        });

        it("renders feedbackContent when provided", () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    feedbackContent={<p>polling...</p>}
                />
            );
            expect(screen.getByText("polling...")).toBeDefined();
        });
    });

    describe("close behaviour", () => {
        it("calls onClose when the close button is clicked", () => {
            const onClose = vi.fn();
            render(<BarcodeScanner open onClose={onClose} onScan={() => {}} />);

            fireEvent.click(screen.getByLabelText("Close"));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("camera lazy load", () => {
        it("instantiates Html5Qrcode after html5-qrcode is dynamically imported", async () => {
            render(<BarcodeScanner open onClose={() => {}} onScan={() => {}} />);

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });
            expect(instances[0].start).toHaveBeenCalledTimes(1);
        });

        it("forwards the requested formats list to Html5Qrcode", async () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    formats={["QR_CODE", "EAN_13"]}
                />
            );

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });
            expect(instances[0].options.formatsToSupport).toEqual([0, 1]);
        });

        it("uses the default fps (10) and qrbox (280x150) when not overridden", async () => {
            render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const config = instances[0].start.mock.calls[0][1];
            expect(config.fps).toBe(10);
            expect(config.qrbox).toEqual({ width: 280, height: 150 });
        });

        it("forwards a custom qrbox to Html5Qrcode.start", async () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    qrbox={{ width: 320, height: 200 }}
                />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const config = instances[0].start.mock.calls[0][1];
            expect(config.qrbox).toEqual({ width: 320, height: 200 });
        });

        it("forwards a custom fps to Html5Qrcode.start", async () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    fps={20}
                />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const config = instances[0].start.mock.calls[0][1];
            expect(config.fps).toBe(20);
        });

        it("enables experimentalFeatures.useBarCodeDetectorIfSupported by default", async () => {
            render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const config = instances[0].start.mock.calls[0][1];
            expect(config.experimentalFeatures).toEqual({
                useBarCodeDetectorIfSupported: true,
            });
        });

        it("forwards a custom experimentalFeatures object to Html5Qrcode.start", async () => {
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    experimentalFeatures={{ useBarCodeDetectorIfSupported: false }}
                />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const config = instances[0].start.mock.calls[0][1];
            expect(config.experimentalFeatures).toEqual({
                useBarCodeDetectorIfSupported: false,
            });
        });

        it("defaults to { facingMode: 'environment' } when videoConstraints is omitted", async () => {
            render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const cameraArg = instances[0].start.mock.calls[0][0];
            expect(cameraArg).toEqual({ facingMode: "environment" });
        });

        it("forwards custom videoConstraints to Html5Qrcode.start as the camera arg", async () => {
            const constraints = {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            };
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={() => {}}
                    videoConstraints={constraints}
                />
            );

            await waitFor(() => {
                expect(instances[0]?.start).toHaveBeenCalled();
            });

            const cameraArg = instances[0].start.mock.calls[0][0];
            expect(cameraArg).toEqual(constraints);
        });

        it("stops the scanner on unmount", async () => {
            const { unmount } = render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });

            unmount();

            expect(instances[0].stop).toHaveBeenCalled();
            expect(instances[0].clear).toHaveBeenCalled();
        });
    });

    describe("safe stop guard", () => {
        it("does not call stop() when the scanner is in NOT_STARTED state", async () => {
            const { unmount } = render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });

            // Simulate an instance that was reset / never actually started
            instances[0].state = 1; // NOT_STARTED
            instances[0].stop.mockClear();

            unmount();

            // The guard must short-circuit so stop() is never called
            expect(instances[0].stop).not.toHaveBeenCalled();
        });

        it("does call stop() when the scanner is in PAUSED state", async () => {
            const { unmount } = render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });

            instances[0].state = 3; // PAUSED
            instances[0].stop.mockClear();

            unmount();

            expect(instances[0].stop).toHaveBeenCalled();
        });

        it("tolerates getState() throwing without crashing the cleanup", async () => {
            const { unmount } = render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });

            instances[0].getState = () => {
                throw new Error("dead instance");
            };

            expect(() => unmount()).not.toThrow();
        });

        it("does not throw when handleClose is called twice", async () => {
            const onClose = vi.fn();
            render(<BarcodeScanner open onClose={onClose} onScan={() => {}} />);

            await waitFor(() => {
                expect(instances.length).toBe(1);
            });

            // First close: scanner gets stopped, state is NOT_STARTED
            // Second close: must not throw despite stop() being a no-op now
            const closeButton = screen.getByLabelText("Close");
            expect(() => {
                fireEvent.click(closeButton);
                fireEvent.click(closeButton);
            }).not.toThrow();
            expect(onClose).toHaveBeenCalledTimes(2);
        });
    });

    describe("scan callback", () => {
        it("calls onScan with the decoded text and closes (non-continuous)", async () => {
            const onScan = vi.fn();
            const onClose = vi.fn();
            render(<BarcodeScanner open onClose={onClose} onScan={onScan} />);

            await waitFor(() => {
                expect(capturedCb.successCallback).not.toBeNull();
            });

            capturedCb.successCallback("ABC123");

            expect(onScan).toHaveBeenCalledWith("ABC123");
            expect(navigator.vibrate).toHaveBeenCalledWith(100);
            expect(instances[0].stop).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });

        it("does not close when continuous=true", async () => {
            const onScan = vi.fn();
            const onClose = vi.fn();
            render(
                <BarcodeScanner open onClose={onClose} onScan={onScan} continuous />
            );

            await waitFor(() => {
                expect(capturedCb.successCallback).not.toBeNull();
            });

            capturedCb.successCallback("XYZ");

            expect(onScan).toHaveBeenCalledWith("XYZ");
            expect(onClose).not.toHaveBeenCalled();
        });

        it("debounces consecutive scans of the same code", async () => {
            const onScan = vi.fn();
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={onScan}
                    continuous
                    debounceMs={500}
                />
            );

            await waitFor(() => {
                expect(capturedCb.successCallback).not.toBeNull();
            });

            capturedCb.successCallback("DUP");
            capturedCb.successCallback("DUP");
            capturedCb.successCallback("DUP");

            expect(onScan).toHaveBeenCalledTimes(1);
        });

        it("accepts a different code immediately even within the debounce window", async () => {
            const onScan = vi.fn();
            render(
                <BarcodeScanner
                    open
                    onClose={() => {}}
                    onScan={onScan}
                    continuous
                />
            );

            await waitFor(() => {
                expect(capturedCb.successCallback).not.toBeNull();
            });

            capturedCb.successCallback("AAA");
            capturedCb.successCallback("BBB");

            expect(onScan).toHaveBeenCalledTimes(2);
            expect(onScan).toHaveBeenNthCalledWith(1, "AAA");
            expect(onScan).toHaveBeenNthCalledWith(2, "BBB");
        });
    });

    describe("manual entry", () => {
        it("opens manual entry form when the button is clicked", () => {
            render(<BarcodeScanner open onClose={() => {}} onScan={() => {}} />);

            fireEvent.click(screen.getByText("Enter manually"));

            expect(screen.getByPlaceholderText("Code...")).toBeDefined();
            expect(screen.getByRole("button", { name: "Validate" })).toBeDefined();
        });

        it("calls onScan with trimmed value and closes (non-continuous)", () => {
            const onScan = vi.fn();
            const onClose = vi.fn();
            render(<BarcodeScanner open onClose={onClose} onScan={onScan} />);

            fireEvent.click(screen.getByText("Enter manually"));

            const input = screen.getByPlaceholderText("Code...");
            fireEvent.change(input, { target: { value: "  HELLO  " } });
            fireEvent.click(screen.getByRole("button", { name: "Validate" }));

            expect(onScan).toHaveBeenCalledWith("HELLO");
            expect(onClose).toHaveBeenCalled();
        });

        it("ignores empty manual input", () => {
            const onScan = vi.fn();
            render(<BarcodeScanner open onClose={() => {}} onScan={onScan} />);

            fireEvent.click(screen.getByText("Enter manually"));
            fireEvent.click(screen.getByRole("button", { name: "Validate" }));

            expect(onScan).not.toHaveBeenCalled();
        });

        it("validates on Enter key", () => {
            const onScan = vi.fn();
            render(<BarcodeScanner open onClose={() => {}} onScan={onScan} />);

            fireEvent.click(screen.getByText("Enter manually"));

            const input = screen.getByPlaceholderText("Code...");
            fireEvent.change(input, { target: { value: "FROMENTER" } });
            fireEvent.keyDown(input, { key: "Enter" });

            expect(onScan).toHaveBeenCalledWith("FROMENTER");
        });

        it("clears input but does not close when continuous=true", () => {
            const onClose = vi.fn();
            render(
                <BarcodeScanner
                    open
                    onClose={onClose}
                    onScan={() => {}}
                    continuous
                />
            );

            fireEvent.click(screen.getByText("Enter manually"));
            const input = screen.getByPlaceholderText("Code...");
            fireEvent.change(input, { target: { value: "ABC" } });
            fireEvent.click(screen.getByRole("button", { name: "Validate" }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByPlaceholderText("Code...").value).toBe("");
        });
    });

    describe("embedded mode", () => {
        it("renders without the fullscreen overlay wrapper", () => {
            const { container } = render(
                <BarcodeScanner
                    open
                    embedded
                    onClose={() => {}}
                    onScan={() => {}}
                />
            );

            const wrapper = container.querySelector("[data-component='BarcodeScanner']");
            expect(wrapper).not.toBeNull();
            expect(wrapper.getAttribute("data-embedded")).toBe("true");
            expect(wrapper.className).not.toContain("fixed");
            expect(wrapper.className).not.toContain("inset-0");
            expect(wrapper.className).not.toContain("z-50");
        });

        it("does not render the title bar or the close button when embedded", () => {
            render(
                <BarcodeScanner
                    open
                    embedded
                    onClose={() => {}}
                    onScan={() => {}}
                />
            );

            expect(screen.queryByText("Scan a code")).toBeNull();
            expect(screen.queryByLabelText("Close")).toBeNull();
        });

        it("still renders the camera region and the manual entry button when embedded", () => {
            const { container } = render(
                <BarcodeScanner
                    open
                    embedded
                    onClose={() => {}}
                    onScan={() => {}}
                />
            );

            expect(container.querySelector("#barcode-scanner-region")).not.toBeNull();
            expect(screen.getByText("Enter manually")).toBeDefined();
        });

        it("still calls onScan from the camera callback when embedded", async () => {
            const onScan = vi.fn();
            render(
                <BarcodeScanner
                    open
                    embedded
                    onClose={() => {}}
                    onScan={onScan}
                    continuous
                />
            );

            await waitFor(() => {
                expect(capturedCb.successCallback).not.toBeNull();
            });

            capturedCb.successCallback("EMBEDDED-SCAN");

            expect(onScan).toHaveBeenCalledWith("EMBEDDED-SCAN");
        });

        it("still defaults to the fullscreen overlay when embedded is false", () => {
            const { container } = render(
                <BarcodeScanner open onClose={() => {}} onScan={() => {}} />
            );

            const wrapper = container.querySelector("[data-component='BarcodeScanner']");
            expect(wrapper).not.toBeNull();
            expect(wrapper.getAttribute("data-embedded")).toBeNull();
            expect(wrapper.className).toContain("fixed");
            expect(wrapper.className).toContain("inset-0");
            expect(wrapper.className).toContain("z-50");
            expect(screen.getByLabelText("Close")).toBeDefined();
        });
    });
});
