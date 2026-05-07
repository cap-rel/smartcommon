import { BarcodeScanner } from "./";

export default {
    title: "Components/Others/BarcodeScanner",
    component: BarcodeScanner,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Fullscreen camera barcode/QR scanner. Lazy-loads " +
                    "html5-qrcode on first open so projects that never " +
                    "scan don't pay the bundle cost. Supports manual entry " +
                    "fallback when the camera is unavailable. All labels " +
                    "are overridable via the `labels` prop.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        open: { control: "boolean", table: { category: "Main" } },
        continuous: { control: "boolean", table: { category: "Main" } },
        formats: { control: "object", table: { category: "Main" } },
        fps: { control: "number", table: { category: "Main" } },
        qrbox: { control: "object", table: { category: "Main" } },
        debounceMs: { control: "number", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        feedbackContent: { table: { category: "Main" } },
        onScan: { action: "scanned", table: { category: "Events" } },
        onClose: { action: "closed", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def, Continuous as Cont } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Continuous = { tags: ["!dev"], ...Cont };

export { BarcodeScanner } from "./stories";
