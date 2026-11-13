import { fn } from "storybook/test";
import { FaBoxArchive, FaCopy, FaEllipsisVertical, FaPen, FaTrash } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        align: "right",
        trigger: (
            <button
                type="button"
                aria-label="Actions"
                className="flex items-center justify-center w-9 h-9 rounded-app-md border border-border bg-soft-bg text-medium-text hover:bg-medium-bg"
            >
                <FaEllipsisVertical />
            </button>
        ),
        items: [
            { label: "Edit", icon: <FaPen />, onClick: fn() },
            { label: "Duplicate", icon: <FaCopy />, onClick: fn() },
            { label: "Archive", icon: <FaBoxArchive />, disabled: true, onClick: fn() },
            { divider: true },
            { label: "Delete", icon: <FaTrash />, danger: true, onClick: fn() },
        ],
    },
    code: `
        import { Dropdown } from "@cap-rel/smartcommon";
        import { FaEllipsisVertical, FaPen, FaCopy, FaBoxArchive, FaTrash } from "react-icons/fa6";

        <Dropdown
          trigger={<button type="button" aria-label="Actions"><FaEllipsisVertical /></button>}
          align="right"
          items={[
            { label: "Edit", icon: <FaPen />, onClick: edit },
            { label: "Duplicate", icon: <FaCopy />, onClick: duplicate },
            { label: "Archive", icon: <FaBoxArchive />, disabled: !canArchive, onClick: archive },
            { divider: true },
            { label: "Delete", icon: <FaTrash />, danger: true, onClick: remove },
          ]}
        />
    `,
});
