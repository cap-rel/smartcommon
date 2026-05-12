/**
 * ESC/POS command builder for thermal receipt printers.
 *
 * Generic, no business coupling. Builds a binary command buffer (Uint8Array)
 * to send to a thermal printer over USB or network.
 *
 * @param {number} charsPerLine - Characters per line (32 for 58mm, 48 for 80mm)
 */

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export class TicketBuilder {
    constructor(charsPerLine = 48) {
        this.charsPerLine = charsPerLine;
        this.encoder = new TextEncoder();
        this.buffer = [];
    }

    init() {
        this.buffer.push(ESC, 0x40);
        return this;
    }

    text(str, opts = {}) {
        if (opts.bold) this.bold(true);
        if (opts.doubleHeight) this.doubleHeight(true);
        if (opts.center) this.alignCenter();

        const encoded = this.encoder.encode(str);
        this.buffer.push(...encoded, LF);

        if (opts.bold) this.bold(false);
        if (opts.doubleHeight) this.doubleHeight(false);
        if (opts.center) this.alignLeft();

        return this;
    }

    line(left, right) {
        const maxLeft = this.charsPerLine - right.length - 1;
        const truncatedLeft = left.length > maxLeft ? left.substring(0, maxLeft) : left;
        const spaces = this.charsPerLine - truncatedLeft.length - right.length;
        const padding = spaces > 0 ? " ".repeat(spaces) : " ";
        const lineStr = truncatedLeft + padding + right;
        const encoded = this.encoder.encode(lineStr);
        this.buffer.push(...encoded, LF);
        return this;
    }

    separator() {
        const encoded = this.encoder.encode("-".repeat(this.charsPerLine));
        this.buffer.push(...encoded, LF);
        return this;
    }

    bold(on) {
        this.buffer.push(ESC, 0x45, on ? 0x01 : 0x00);
        return this;
    }

    doubleHeight(on) {
        this.buffer.push(GS, 0x21, on ? 0x10 : 0x00);
        return this;
    }

    alignCenter() {
        this.buffer.push(ESC, 0x61, 0x01);
        return this;
    }

    alignLeft() {
        this.buffer.push(ESC, 0x61, 0x00);
        return this;
    }

    cut() {
        this.buffer.push(LF, LF, LF);
        this.buffer.push(GS, 0x56, 0x00);
        return this;
    }

    openDrawer() {
        this.buffer.push(ESC, 0x70, 0x00, 0x19, 0x78);
        return this;
    }

    qrCode(data) {
        const encoded = this.encoder.encode(data);
        const len = encoded.length + 3;
        const pL = len & 0xff;
        const pH = (len >> 8) & 0xff;

        this.buffer.push(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
        this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x04);
        this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31);
        this.buffer.push(GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...encoded);
        this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);

        return this;
    }

    build() {
        return new Uint8Array(this.buffer);
    }
}
