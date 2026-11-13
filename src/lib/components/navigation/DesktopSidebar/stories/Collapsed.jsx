import { fn } from "storybook/test";

import { setDefaultStory } from "../../../../../storybook";

import { demoBrand, demoLinks } from "./links";

export const Collapsed = setDefaultStory({
    args: {
        brand: demoBrand,
        links: demoLinks(fn()),
        defaultCollapsed: true,
        storageKey: null,
        asideProps: { className: "h-full" },
    },
    code: `
        import { DesktopSidebar } from "@cap-rel/smartcommon";

        // Starts as an icon rail; storageKey={null}: nothing read from or
        // written to localStorage.
        <DesktopSidebar links={links} defaultCollapsed storageKey={null} />
    `,
});

Collapsed.parameters.docs.description = {
    story: "Icon rail: labels hidden, each entry keeps its name (aria-label and tooltip). `storageKey={null}` disables the localStorage persistence, so `defaultCollapsed` always applies.",
};
