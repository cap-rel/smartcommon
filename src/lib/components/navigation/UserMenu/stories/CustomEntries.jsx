import { fn } from "storybook/test";
import { FaCircleInfo, FaKeyboard } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

export const CustomEntries = setDefaultStory({
    args: {
        user: { email: "bob@example.com" },
        onSettings: fn(),
        onLogout: fn(),
        items: [
            { key: "shortcuts", label: "Keyboard shortcuts", icon: <FaKeyboard />, onClick: fn() },
            { key: "about", label: "About", icon: <FaCircleInfo />, onClick: fn() },
        ],
    },
    code: `
        import { UserMenu } from "@cap-rel/smartcommon";

        <UserMenu
          user={{ email: "bob@example.com" }}
          onSettings={() => setSettingsOpen(true)}
          onLogout={() => session.close()}
          items={[
            { key: "shortcuts", label: "Keyboard shortcuts", icon: <FaKeyboard />, onClick: showShortcuts },
            { key: "about", label: "About", icon: <FaCircleInfo />, onClick: showAbout },
          ]}
        />
    `,
});

CustomEntries.parameters.docs.description = {
    story: "Explicit `user` (email shown when there is no username), `onSettings` / `onLogout` replacing the defaults, and `items` added between Settings and Log out.",
};
