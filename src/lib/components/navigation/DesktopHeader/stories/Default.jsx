import { fn } from "storybook/test";
import { FaPlus } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";
import { Button } from "../../../little/Button";

export const Default = setDefaultStory({
    args: {
        title: "Interventions",
        subtitle: "12 in progress",
        onBack: fn(),
        search: (
            <input
                type="search"
                aria-label="Search"
                placeholder="Search"
                className="w-full rounded-app-md border border-border bg-soft-bg px-app-sm py-app-xs text-app-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
        ),
        actions: <Button id="new-intervention" label="New" icon={FaPlus} onClick={fn()} />,
    },
    code: `
        import { DesktopHeader, Button } from "@cap-rel/smartcommon";

        <div className="flex flex-col h-full">
          <DesktopHeader
            title="Interventions"
            subtitle={\`\${count} in progress\`}
            onBack={() => navigate(-1)}
            search={<input type="search" placeholder="Search" />}
            actions={<Button id="new-intervention" label="New" icon={FaPlus} onClick={create} />}
          />
          <div className="flex-1 min-h-0">...</div>
        </div>
    `,
});
