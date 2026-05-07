import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        open: true,
        continuous: false,
    },
    code: `
        import { useState } from "react";
        import { BarcodeScanner } from "@cap-rel/smartcommon";

        const [open, setOpen] = useState(false);

        <button onClick={() => setOpen(true)}>Scan</button>
        <BarcodeScanner
          open={open}
          onClose={() => setOpen(false)}
          onScan={(text) => console.log("scanned:", text)}
        />
    `,
});
