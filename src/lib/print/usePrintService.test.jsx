import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { usbInstance, usbConstructorSpy } = vi.hoisted(() => {
    const instance = {
        connect: vi.fn(() => Promise.resolve()),
        send: vi.fn(() => Promise.resolve()),
        disconnect: vi.fn(() => Promise.resolve()),
        isConnected: vi.fn(() => true),
    };
    const ctor = vi.fn(function FakeWebUSBPrinter() {
        Object.assign(this, instance);
    });
    return { usbInstance: instance, usbConstructorSpy: ctor };
});

vi.mock("./webUSBPrinter", () => ({
    WebUSBPrinter: usbConstructorSpy,
}));

const browserPrintSpy = vi.hoisted(() => vi.fn(() => Promise.resolve()));
vi.mock("./browserPrint", () => ({
    browserPrint: browserPrintSpy,
}));

import { usePrintService } from "./usePrintService";

const usbPrinter = { protocol: "usb", paper_width: 80 };

beforeEach(() => {
    usbInstance.send.mockClear();
    usbInstance.disconnect.mockClear();
    browserPrintSpy.mockClear();
});

describe("usePrintService", () => {
    it("registers all templates passed at mount", async () => {
        const escposSale = vi.fn();
        const escposDrawer = vi.fn();

        const { result } = renderHook(() =>
            usePrintService({
                templates: {
                    sale: { escpos: escposSale },
                    drawer: { escpos: escposDrawer },
                },
            })
        );

        await act(async () => {
            await result.current.enqueue("sale", { id: 1 }, usbPrinter);
        });
        await act(async () => {
            await result.current.enqueue("drawer", {}, usbPrinter);
        });

        expect(escposSale).toHaveBeenCalledTimes(1);
        expect(escposDrawer).toHaveBeenCalledTimes(1);
    });

    it("disposes the underlying service on unmount", async () => {
        const { result, unmount } = renderHook(() =>
            usePrintService({
                templates: { t: { escpos: () => {} } },
            })
        );

        await act(async () => {
            await result.current.enqueue("t", {}, usbPrinter);
        });

        unmount();
        // cleanup() is async; wait for the disconnect call.
        await waitFor(() => {
            expect(usbInstance.disconnect).toHaveBeenCalledTimes(1);
        });
    });

    it("exposes a reactive pendingCount", async () => {
        const { result } = renderHook(() =>
            usePrintService({
                templates: { t: { escpos: () => {} } },
            })
        );

        expect(result.current.pendingCount).toBe(0);

        await act(async () => {
            await result.current.enqueue("t", {}, usbPrinter);
        });

        expect(result.current.pendingCount).toBe(0);
    });

    it("propagates labels to the underlying service", async () => {
        const { result } = renderHook(() =>
            usePrintService({
                labels: { unknownJobType: (type) => `mock-${type}` },
            })
        );
        result.current.service.delay = () => Promise.resolve();

        await act(async () => {
            await expect(
                result.current.enqueue("ghost", {}, usbPrinter)
            ).rejects.toThrow("mock-ghost");
        });
    });
});
