import { setDefaultStory } from "../../../../../storybook";

export const Continuous = setDefaultStory({
    args: {
        open: true,
        continuous: true,
        labels: { title: "Scan multiple codes" },
    },
    code: `
        import { BarcodeScanner } from "@cap-rel/smartcommon";

        // Stays open after each scan, lets the user scan many codes in a row.
        <BarcodeScanner
          open
          continuous
          onScan={(text) => addToCart(text)}
          onClose={() => stopScanning()}
        />
    `,
});
