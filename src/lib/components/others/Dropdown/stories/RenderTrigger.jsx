import { fn } from "storybook/test";
import { FaChevronDown, FaFileExport, FaPrint } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

// A render function receives { open, toggle, triggerProps }: the caller wires
// toggle and spreads triggerProps (ARIA attributes, id, arrow keys).
const renderTrigger = ({ open, toggle, triggerProps }) => (
    <button
        type="button"
        { ...triggerProps }
        onClick={toggle}
        className="flex items-center gap-app-xs rounded-app-md border border-border bg-soft-bg px-app-sm py-app-xs text-app-sm hover:bg-medium-bg"
    >
        Export
        <FaChevronDown aria-hidden="true" className={`text-app-xs transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
);

export const RenderTrigger = setDefaultStory({
    args: {
        align: "left",
        trigger: renderTrigger,
        items: [
            { label: "Export as CSV", icon: <FaFileExport />, onClick: fn() },
            { label: "Print", icon: <FaPrint />, onClick: fn() },
        ],
    },
    code: `
        import { Dropdown } from "@cap-rel/smartcommon";

        <Dropdown
          align="left"
          trigger={({ open, toggle, triggerProps }) => (
            <button type="button" {...triggerProps} onClick={toggle}>
              Export <FaChevronDown className={open ? "rotate-180" : ""} />
            </button>
          )}
          items={[
            { label: "Export as CSV", icon: <FaFileExport />, onClick: exportCsv },
            { label: "Print", icon: <FaPrint />, onClick: print },
          ]}
        />
    `,
});

RenderTrigger.parameters.docs.description = {
    story: "`trigger` as a render function: the caller spreads `triggerProps` on its own button and calls `toggle`.",
};
