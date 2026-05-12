/**
 * WebUSB driver for ESC/POS thermal printers.
 *
 * Generic, no business coupling. Communicates with USB thermal printers
 * via the Web USB API. Requires a user gesture for device selection.
 */

const PRINTER_FILTERS = [
    { classCode: 7 }, // Printer class
];

export class WebUSBPrinter {
    constructor() {
        this.device = null;
        this.interfaceNumber = -1;
        this.endpointNumber = -1;
    }

    static isSupported() {
        return typeof navigator !== "undefined" && Boolean(navigator.usb);
    }

    async connect() {
        if (!WebUSBPrinter.isSupported()) {
            throw new Error("WebUSB is not supported in this browser");
        }

        this.device = await navigator.usb.requestDevice({
            filters: PRINTER_FILTERS,
        });

        await this.device.open();

        if (this.device.configuration === null) {
            await this.device.selectConfiguration(1);
        }

        const iface = this.device.configuration.interfaces.find((i) =>
            i.alternate.endpoints.some(
                (e) => e.direction === "out" && e.type === "bulk"
            )
        );

        if (!iface) {
            throw new Error("No suitable printer interface found on device");
        }

        this.interfaceNumber = iface.interfaceNumber;

        const endpoint = iface.alternate.endpoints.find(
            (e) => e.direction === "out" && e.type === "bulk"
        );
        this.endpointNumber = endpoint.endpointNumber;

        await this.device.claimInterface(this.interfaceNumber);
    }

    async send(data) {
        if (!this.device || !this.device.opened) {
            throw new Error("Printer is not connected");
        }

        const CHUNK_SIZE = 64;
        for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
            const chunk = data.slice(offset, offset + CHUNK_SIZE);
            await this.device.transferOut(this.endpointNumber, chunk);
        }
    }

    async disconnect() {
        if (this.device) {
            try {
                if (this.interfaceNumber >= 0) {
                    await this.device.releaseInterface(this.interfaceNumber);
                }
                await this.device.close();
            } catch (err) {
                console.warn("[WebUSBPrinter] Error during disconnect:", err.message);
            }
            this.device = null;
            this.interfaceNumber = -1;
            this.endpointNumber = -1;
        }
    }

    isConnected() {
        return this.device !== null && this.device.opened;
    }
}
