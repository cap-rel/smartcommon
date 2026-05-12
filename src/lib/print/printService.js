/**
 * Generic print orchestrator.
 *
 * Routes print jobs to the correct printer adapter (WebUSB, network, browser)
 * based on the printer configuration. Manages a sequential job queue with retries.
 *
 * Job types are not hardcoded: callers register them upfront via
 * registerJobType(type, { escpos, html }) where each renderer is a pure
 * function that turns job data into either ESC/POS bytes (via TicketBuilder)
 * or an HTML string (for browser print fallback).
 */

import { TicketBuilder } from "./ticketBuilder";
import { WebUSBPrinter } from "./webUSBPrinter";
import { browserPrint } from "./browserPrint";
import { DEFAULT_LABELS } from "./labels";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * @typedef {object} PrinterConfig
 * @property {string} protocol - 'usb', 'network', or 'browser'
 * @property {string} [connection] - IP:port for network printers
 * @property {number} [paper_width] - Paper width in mm (58 or 80)
 */

/**
 * @typedef {object} JobRenderers
 * @property {(data: object, builder: TicketBuilder) => void} [escpos] - Populates the builder with ESC/POS commands
 * @property {(data: object) => string} [html] - Returns a complete HTML document for browser print
 */

/**
 * @typedef {object} PrintJob
 * @property {string} type
 * @property {object} data
 * @property {PrinterConfig} printer
 * @property {number} retries
 * @property {function} resolve
 * @property {function} reject
 */

/**
 * Build an Error with a machine-readable `code` and a localized `message`.
 *
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
function buildError(code, message) {
    const err = new Error(message);
    err.code = code;
    return err;
}

export class PrintService {
    /**
     * @param {object} [options]
     * @param {object} [options.labels] - i18n labels (merged with DEFAULT_LABELS)
     */
    constructor(options = {}) {
        /** @type {PrintJob[]} */
        this.queue = [];
        this.processing = false;
        /** @type {WebUSBPrinter|null} */
        this.usbPrinter = null;
        /** @type {Record<string, JobRenderers>} */
        this.renderers = {};
        this.labels = { ...DEFAULT_LABELS, ...(options.labels || {}) };
    }

    /**
     * Register the renderers for a job type. Must be called before enqueueing
     * a job of that type.
     *
     * @param {string} type
     * @param {JobRenderers} renderers
     */
    registerJobType(type, renderers) {
        if (!type || typeof type !== "string") {
            throw new Error("[PrintService] registerJobType: type must be a non-empty string");
        }
        if (!renderers || (!renderers.escpos && !renderers.html)) {
            throw new Error(`[PrintService] registerJobType: at least one renderer (escpos or html) is required for type "${type}"`);
        }
        this.renderers[type] = { ...this.renderers[type], ...renderers };
    }

    /**
     * @param {number} paperWidth - Paper width in mm
     * @returns {number} Characters per line
     */
    static getCharsPerLine(paperWidth) {
        return paperWidth === 58 ? 32 : 48;
    }

    get pendingCount() {
        return this.queue.length;
    }

    /**
     * Add a job to the queue.
     *
     * @param {string} type
     * @param {object} data
     * @param {PrinterConfig} printer
     * @returns {Promise<void>}
     */
    enqueue(type, data, printer) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                type,
                data,
                printer,
                retries: MAX_RETRIES,
                resolve,
                reject,
            });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const job = this.queue[0];

            try {
                await this.executeJob(job);
                this.queue.shift();
                job.resolve();
            } catch (err) {
                job.retries--;
                if (job.retries <= 0) {
                    this.queue.shift();
                    job.reject(err);
                } else {
                    console.warn(
                        `[PrintService] Job failed, retrying (${job.retries} left):`,
                        err.message
                    );
                    await this.delay(RETRY_DELAY_MS);
                }
            }
        }

        this.processing = false;
    }

    async executeJob(job) {
        const { type, data, printer } = job;
        const protocol = printer.protocol || "browser";
        const paperWidth = printer.paper_width || 80;
        const charsPerLine = PrintService.getCharsPerLine(paperWidth);

        const renderers = this.renderers[type];
        if (!renderers) {
            throw buildError("unknown_job_type", this.labels.unknownJobType(type));
        }

        if (protocol === "browser") {
            if (!renderers.html) {
                // Some jobs (e.g. cash drawer) have no HTML equivalent: skip with a warning
                console.warn(`[PrintService] Job type "${type}" has no HTML renderer; skipping in browser mode`);
                return;
            }
            const html = renderers.html(data);
            await browserPrint(html);
            return;
        }

        if (!renderers.escpos) {
            throw buildError("no_escpos_renderer", this.labels.noEscposRenderer(type));
        }
        const builder = new TicketBuilder(charsPerLine);
        renderers.escpos(data, builder);
        const commandData = builder.build();

        if (protocol === "usb") {
            await this.sendViaUsb(commandData);
        } else if (protocol === "network") {
            await this.sendViaNetwork(commandData, printer.connection);
        } else {
            throw buildError("unsupported_protocol", this.labels.unsupportedProtocol(protocol));
        }
    }

    async sendViaUsb(data) {
        if (!this.usbPrinter || !this.usbPrinter.isConnected()) {
            this.usbPrinter = new WebUSBPrinter();
            await this.usbPrinter.connect();
        }
        await this.usbPrinter.send(data);
    }

    async sendViaNetwork(_data, connection) {
        // Network printing requires a proxy or native bridge.
        // PWAs cannot open raw TCP sockets from the browser.
        console.warn(
            `[PrintService] Direct network printing to ${connection} not available in browser context. A print proxy server is needed.`
        );
        throw buildError("network_not_supported", this.labels.networkNotSupported);
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async cleanup() {
        if (this.usbPrinter) {
            await this.usbPrinter.disconnect();
            this.usbPrinter = null;
        }
    }
}
