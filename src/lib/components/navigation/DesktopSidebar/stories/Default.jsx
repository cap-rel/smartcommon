import { fn } from "storybook/test";

import { setDefaultStory } from "../../../../../storybook";

import { demoBrand, demoLinks } from "./links";

export const Default = setDefaultStory({
    args: {
        brand: demoBrand,
        links: demoLinks(fn()),
        footer: ({ collapsed }) => (collapsed ? null : <p className="px-2.5 pb-1 text-app-xs text-soft-text">v1.4.0</p>),
        onCollapsedChange: fn(),
        // The story shell has a bounded height: fill it instead of the viewport.
        asideProps: { className: "h-full" },
    },
    code: `
        import { DesktopSidebar } from "@cap-rel/smartcommon";
        import { FaHouse, FaRocket, FaUsers, FaCircleQuestion } from "react-icons/fa6";

        <DesktopSidebar
          brand={({ collapsed }) => (collapsed ? <Logo small /> : <Logo />)}
          links={[
            { id: "home", label: "Home", icon: FaHouse, to: "/" },
            { id: "interventions", label: "Interventions", icon: FaRocket, to: "/interventions", badge: late },
            { id: "clients", label: "Clients", icon: FaUsers, to: "/clients" },
            { id: "help", label: "Help", icon: FaCircleQuestion, onClick: openHelp },
          ]}
          footer={({ collapsed }) => (collapsed ? null : <p>v{APP_VERSION}</p>)}
        />
    `,
});
