import { useState } from "react";
import { fn } from "storybook/test";

import { setDefaultStory } from "../../../../../storybook";

import { DesktopSidebar } from "../";
import { demoBrand, demoLinks } from "./links";

// The parent owns the collapse state: the sidebar only reports the next
// value through onCollapsedChange.
const ControlledSidebar = (args) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <DesktopSidebar
            { ...args }
            collapsed={collapsed}
            onCollapsedChange={(next) => {
                setCollapsed(next);
                args.onCollapsedChange?.(next);
            }}
        />
    );
};

export const Controlled = setDefaultStory({
    args: {
        brand: demoBrand,
        links: demoLinks(fn()),
        onCollapsedChange: fn(),
        asideProps: { className: "h-full" },
    },
    code: `
        import { DesktopSidebar } from "@cap-rel/smartcommon";

        const [collapsed, setCollapsed] = useState(settings.sidebarCollapsed);

        <DesktopSidebar
          links={links}
          collapsed={collapsed}
          onCollapsedChange={(next) => {
            setCollapsed(next);
            saveSettings({ sidebarCollapsed: next });
          }}
        />
    `,
});

Controlled.parameters.docs.description = {
    story: "Controlled mode: `collapsed` + `onCollapsedChange(next)`. The parent keeps (and persists) the state, `storageKey` is not used.",
};

Controlled.render = (args) => <ControlledSidebar { ...args } />;
