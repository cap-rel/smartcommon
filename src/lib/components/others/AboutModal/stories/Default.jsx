import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        open: true,
        appName: "MyApp",
        version: "1.2.3",
    },
    code: `
        import { useState } from "react";
        import { AboutModal } from "@cap-rel/smartcommon";

        const [isOpen, setIsOpen] = useState(false);

        <button onClick={() => setIsOpen(true)}>About</button>
        <AboutModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          appName="MyApp"
          version="1.2.3"
        />
    `,
});
