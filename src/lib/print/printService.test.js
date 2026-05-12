import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mock for WebUSBPrinter so the PrintService can import it without
// touching the real WebUSB API (which is undefined under happy-dom).
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

// browserPrint is called directly; replace it with a spy so we don't try to
// mount an iframe.
const browserPrintSpy = vi.hoisted(() => vi.fn(() => Promise.resolve()));
vi.mock("./browserPrint", () => ({
    browserPrint: browserPrintSpy,
}));

import { PrintService } from "./printService";

const usbPrinter = { protocol: "usb", paper_width: 80 };
const browserPrinter = { protocol: "browser", paper_width: 80 };
const networkPrinter = {
    protocol: "network",
    paper_width: 80,
    connection: "192.168.1.10:9100",
};

beforeEach(() => {
    // mockReset() clears call history AND restores the original implementation
    // set in the hoisted factory. mockClear() leaves prior mockImplementation
    // calls (from earlier tests) in place, which leaks across tests.
    usbInstance.connect.mockReset();
    usbInstance.connect.mockImplementation(() => Promise.resolve());
    usbInstance.send.mockReset();
    usbInstance.send.mockImplementation(() => Promise.resolve());
    usbInstance.disconnect.mockReset();
    usbInstance.disconnect.mockImplementation(() => Promise.resolve());
    usbInstance.isConnected.mockReset();
    usbInstance.isConnected.mockImplementation(() => true);
    usbConstructorSpy.mockClear();
    browserPrintSpy.mockReset();
    browserPrintSpy.mockImplementation(() => Promise.resolve());
});

// Yield to the event loop so the in-flight queue processing has a chance to
// reach the first `await this.usbPrinter.send(...)` (which is the only async
// hand-off in the happy path).
const flushQueue = () => new Promise((res) => setTimeout(res, 0));

describe("PrintService - registration", () => {
    it("registers a job type and resolves when enqueued", async () => {
        const service = new PrintService();
        const escpos = vi.fn();
        service.registerJobType("test", { escpos });

        await service.enqueue("test", { foo: "bar" }, usbPrinter);

        expect(escpos).toHaveBeenCalledTimes(1);
        expect(escpos.mock.calls[0][0]).toEqual({ foo: "bar" });
    });

    it("rejects registerJobType with an invalid type", () => {
        const service = new PrintService();
        expect(() => service.registerJobType("", { escpos: () => {} })).toThrow();
        expect(() => service.registerJobType(null, { escpos: () => {} })).toThrow();
    });

    it("rejects registerJobType when no renderer is provided", () => {
        const service = new PrintService();
        expect(() => service.registerJobType("test", {})).toThrow();
        expect(() => service.registerJobType("test", null)).toThrow();
    });
});

describe("PrintService - unknown job type", () => {
    it("rejects with code unknown_job_type after exhausting retries", async () => {
        const service = new PrintService();
        // Speed up retries: shrink the delay.
        service.delay = () => Promise.resolve();

        await expect(
            service.enqueue("ghost", {}, usbPrinter)
        ).rejects.toMatchObject({ code: "unknown_job_type" });
    });
});

describe("PrintService - queue sequencing", () => {
    it("executes jobs sequentially in the order they were enqueued", async () => {
        const service = new PrintService();
        const calls = [];
        let resolveFirst;

        service.registerJobType("slow", {
            escpos: (data) => {
                calls.push(["slow", data.id]);
            },
        });
        service.registerJobType("fast", {
            escpos: (data) => {
                calls.push(["fast", data.id]);
            },
        });

        // Make the first send hang until we resolve it manually.
        usbInstance.send.mockImplementationOnce(
            () => new Promise((res) => { resolveFirst = res; })
        );

        const p1 = service.enqueue("slow", { id: 1 }, usbPrinter);
        const p2 = service.enqueue("fast", { id: 2 }, usbPrinter);

        // Let processQueue actually start the first job (it awaits send,
        // which is now hanging on resolveFirst).
        await flushQueue();

        // At this point, only the first renderer should have run; the second
        // has been queued but not executed yet.
        expect(calls).toEqual([["slow", 1]]);

        resolveFirst();
        await Promise.all([p1, p2]);

        expect(calls).toEqual([["slow", 1], ["fast", 2]]);
    });
});

describe("PrintService - retry behaviour", () => {
    it("retries up to MAX_RETRIES times and resolves on eventual success", async () => {
        const service = new PrintService();
        service.delay = () => Promise.resolve();
        const renderer = vi.fn();
        service.registerJobType("flaky", { escpos: renderer });

        usbInstance.send
            .mockImplementationOnce(() => Promise.reject(new Error("transient 1")))
            .mockImplementationOnce(() => Promise.reject(new Error("transient 2")))
            .mockImplementationOnce(() => Promise.resolve());

        await service.enqueue("flaky", {}, usbPrinter);

        expect(usbInstance.send).toHaveBeenCalledTimes(3);
        expect(renderer).toHaveBeenCalledTimes(3);
    });

    it("rejects after exhausting retries", async () => {
        const service = new PrintService();
        service.delay = () => Promise.resolve();
        service.registerJobType("doomed", { escpos: () => {} });

        usbInstance.send.mockImplementation(() =>
            Promise.reject(new Error("permanent failure"))
        );

        await expect(
            service.enqueue("doomed", {}, usbPrinter)
        ).rejects.toThrow("permanent failure");

        expect(usbInstance.send).toHaveBeenCalledTimes(3);
    });
});

describe("PrintService - network protocol", () => {
    it("rejects with code network_not_supported after retries", async () => {
        const service = new PrintService();
        service.delay = () => Promise.resolve();
        service.registerJobType("ticket", { escpos: () => {} });

        await expect(
            service.enqueue("ticket", {}, networkPrinter)
        ).rejects.toMatchObject({ code: "network_not_supported" });
    });
});

describe("PrintService - browser protocol", () => {
    it("uses browserPrint with the html renderer", async () => {
        const service = new PrintService();
        service.registerJobType("doc", {
            html: (data) => `<p>${data.text}</p>`,
        });

        await service.enqueue("doc", { text: "hello" }, browserPrinter);

        expect(browserPrintSpy).toHaveBeenCalledWith("<p>hello</p>");
    });

    it("skips browser jobs with no html renderer", async () => {
        const service = new PrintService();
        service.registerJobType("drawer", { escpos: () => {} });

        // No HTML renderer -> the job should silently resolve without
        // touching browserPrint.
        await service.enqueue("drawer", {}, browserPrinter);

        expect(browserPrintSpy).not.toHaveBeenCalled();
    });
});

describe("PrintService - cleanup", () => {
    it("disconnects the USB printer when cleanup is called", async () => {
        const service = new PrintService();
        service.registerJobType("t", { escpos: () => {} });

        await service.enqueue("t", {}, usbPrinter);
        await service.cleanup();

        expect(usbInstance.disconnect).toHaveBeenCalledTimes(1);
        expect(service.usbPrinter).toBeNull();
    });

    it("is a no-op when no USB connection was ever opened", async () => {
        const service = new PrintService();
        await service.cleanup();
        expect(usbInstance.disconnect).not.toHaveBeenCalled();
    });
});

describe("PrintService - labels", () => {
    it("uses overridden labels for error messages", async () => {
        const service = new PrintService({
            labels: {
                unknownJobType: (type) => `Type inconnu : ${type}`,
                networkNotSupported: "Reseau indisponible",
            },
        });
        service.delay = () => Promise.resolve();

        await expect(
            service.enqueue("ghost", {}, usbPrinter)
        ).rejects.toThrow("Type inconnu : ghost");

        service.registerJobType("t", { escpos: () => {} });
        await expect(
            service.enqueue("t", {}, networkPrinter)
        ).rejects.toThrow("Reseau indisponible");
    });
});

describe("PrintService - pendingCount", () => {
    it("reflects the queue length", async () => {
        const service = new PrintService();
        let resolveFirst;
        service.registerJobType("t", { escpos: () => {} });

        usbInstance.send.mockImplementationOnce(
            () => new Promise((res) => { resolveFirst = res; })
        );

        const p1 = service.enqueue("t", {}, usbPrinter);
        const p2 = service.enqueue("t", {}, usbPrinter);

        await flushQueue();

        // Two jobs are queued; the first is in flight (still in queue[0])
        // and the second is waiting.
        expect(service.pendingCount).toBe(2);

        resolveFirst();
        await Promise.all([p1, p2]);
        expect(service.pendingCount).toBe(0);
    });
});
